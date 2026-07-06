using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace ClawInjector
{
    internal static class Program
    {
        private const string PayloadResourceName = "Claw.payload.js";
        private const string LoaderVersion = "4.7.1";
        private const string VersionManifestUrl = "https://raw.githubusercontent.com/l-limon-l/Claw/main/latest.json";
        private const string DefaultReleaseUrl = "https://github.com/l-limon-l/Claw/releases/tag/Main";
        private const int DefaultDebugPort = 10222;
        private static readonly TimeSpan DiscordTargetTimeout = TimeSpan.FromSeconds(90);
        private static readonly TimeSpan StableTargetDelay = TimeSpan.FromSeconds(8);
        private static readonly TimeSpan DevToolsTimeout = TimeSpan.FromSeconds(15);

        private static readonly HttpClient Http = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(10)
        };

        private static readonly JavaScriptSerializer Json = new JavaScriptSerializer
        {
            MaxJsonLength = int.MaxValue,
            RecursionLimit = 128
        };

        public static int Main(string[] args)
        {
            try
            {
                ServicePointManager.SecurityProtocol |= SecurityProtocolType.Tls12;
            }
            catch
            {
                // Best effort for older framework defaults.
            }

            return MainAsync(args).GetAwaiter().GetResult();
        }

        private static async Task<int> MainAsync(string[] args)
        {
            Console.OutputEncoding = Encoding.UTF8;
            Console.Title = "Claw Auto-Injector";

            try
            {
                LoaderOptions options = LoaderOptions.Parse(args);
                PrintLogo();

                if (!await EnsureUpToDateAsync())
                {
                    return 2;
                }

                PrintStep("[1/5]", "Resolving Discord...");
                string discordPath = ResolveDiscordExecutable(options.DiscordExe);
                PrintSubStep(discordPath);

                PrintStep("[2/5]", "Checking debug port and closing Discord...");
                AssertDebugPortAvailable(options.DebugPort);
                StopDiscordProcesses();
                await WaitForDebugPortFreeAsync(options.DebugPort, TimeSpan.FromSeconds(10));

                PrintStep("[3/5]", "Loading embedded payload...");
                string payload = LoadEmbeddedPayload();
                if (string.IsNullOrWhiteSpace(payload))
                {
                    throw new InvalidOperationException("Payload is empty.");
                }
                PrintSubStep(string.Format("{0:N0} characters loaded", payload.Length));

                PrintStep("[4/5]", "Starting Discord and waiting for app page...");
                StartDiscord(discordPath, options.DebugPort);
                DevToolsTarget target = await WaitForDiscordTargetAsync(options.DebugPort);
                PrintSubStep("Ready target: " + target.Url);

                PrintStep("[5/5]", "Injecting Claw payload...");
                await EvaluateAsync(target.WebSocketDebuggerUrl, payload + "\n//# sourceURL=claw-loader-payload.js", false);

                IDictionary<string, object> verification = await EvaluateAsync(
                    target.WebSocketDebuggerUrl,
                    "({ lock: !!window.clawLock, ui: !!document.getElementById('claw-ui'), url: location.href })",
                    true);
                PrintSubStep("Verified: " + DescribeVerification(verification));

                PrintSuccess("Injection successful. Discord is running with Claw.");
                AutoClose();
                return 0;
            }
            catch (Exception ex)
            {
                PrintError(ex.Message);
                Pause(true);
                return 1;
            }
        }

        private static string LoadEmbeddedPayload()
        {
            byte[] bytes = ReadEmbeddedPayloadBytes();

            // Strip a UTF-8 BOM if present so the injected source stays clean.
            if (bytes.Length >= 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF)
            {
                return new UTF8Encoding(false).GetString(bytes, 3, bytes.Length - 3);
            }

            return new UTF8Encoding(false).GetString(bytes);
        }

        private static byte[] ReadEmbeddedPayloadBytes()
        {
            // The payload is compiled into the executable as an embedded resource
            // (see <EmbeddedResource> in ClawInjector.csproj), so there is no runtime
            // download. The same bytes are hashed for the startup version check.
            Assembly assembly = Assembly.GetExecutingAssembly();
            using (Stream stream = assembly.GetManifestResourceStream(PayloadResourceName))
            {
                if (stream == null)
                {
                    throw new InvalidOperationException(
                        "Embedded payload '" + PayloadResourceName + "' was not found. " +
                        "Rebuild with a fresh index.js (run: npm run build, then dotnet build).");
                }

                using (MemoryStream buffer = new MemoryStream())
                {
                    stream.CopyTo(buffer);
                    return buffer.ToArray();
                }
            }
        }

        private static async Task<bool> EnsureUpToDateAsync()
        {
            if (IsTruthy(Environment.GetEnvironmentVariable("CLAW_SKIP_VERSION_CHECK")))
            {
                return true;
            }

            PrintStep("[i]", "Checking for the latest version...");

            VersionManifest manifest;
            try
            {
                string json = await Http.GetStringAsync(VersionManifestUrl);
                manifest = VersionManifest.Parse(Json.DeserializeObject(json) as IDictionary<string, object>);
            }
            catch
            {
                // Offline or manifest unreachable: don't block usage.
                PrintWarning("Could not check for updates (offline?). Continuing with the current build.");
                return true;
            }

            if (manifest == null)
            {
                PrintWarning("Update manifest was invalid. Continuing with the current build.");
                return true;
            }

            string payloadHash;
            string loaderHash;
            try
            {
                payloadHash = ComputeSha256Hex(ReadEmbeddedPayloadBytes());
                loaderHash = ComputeSelfSha256Hex();
            }
            catch
            {
                // If we can't hash our own files, don't block the user.
                PrintWarning("Could not verify the local build. Continuing.");
                return true;
            }

            if (HashesMatch(manifest.PayloadSha256, payloadHash) && HashesMatch(manifest.LoaderSha256, loaderHash))
            {
                PrintSubStep("Up to date (v" + LoaderVersion + ")");
                return true;
            }

            string releaseUrl = string.IsNullOrWhiteSpace(manifest.ReleaseUrl) ? DefaultReleaseUrl : manifest.ReleaseUrl;
            PromptUpdate(manifest.Version, releaseUrl);
            return false;
        }

        private static bool HashesMatch(string expected, string actual)
        {
            // Nothing published to compare against => treat as a match (don't block).
            if (string.IsNullOrWhiteSpace(expected))
            {
                return true;
            }

            return string.Equals(expected.Trim(), actual, StringComparison.OrdinalIgnoreCase);
        }

        private static string ComputeSha256Hex(byte[] data)
        {
            using (SHA256 sha = SHA256.Create())
            {
                byte[] hash = sha.ComputeHash(data);
                StringBuilder sb = new StringBuilder(hash.Length * 2);
                foreach (byte b in hash)
                {
                    sb.Append(b.ToString("x2"));
                }
                return sb.ToString();
            }
        }

        private static string ComputeSelfSha256Hex()
        {
            string exePath = Process.GetCurrentProcess().MainModule.FileName;
            return ComputeSha256Hex(File.ReadAllBytes(exePath));
        }

        private static void PromptUpdate(string latestVersion, string releaseUrl)
        {
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.Write("[UPDATE] ");
            Console.ForegroundColor = ConsoleColor.White;
            string versionSuffix = string.IsNullOrWhiteSpace(latestVersion) ? "" : (" (" + latestVersion + ")");
            Console.WriteLine("A new version" + versionSuffix + " is available. This build (v" + LoaderVersion + ") is outdated.");
            Console.WriteLine("Please download the latest loader to keep quests working.");
            Console.ResetColor();
            Console.WriteLine();

            if (!Console.IsInputRedirected)
            {
                Console.WriteLine("Press Enter to open the download page...");
                try { Console.ReadLine(); } catch { }
            }

            OpenUrl(releaseUrl);
        }

        private static void OpenUrl(string url)
        {
            try
            {
                Process.Start(new ProcessStartInfo { FileName = url, UseShellExecute = true });
            }
            catch
            {
                Console.WriteLine("Open this link manually: " + url);
            }
        }

        private static bool IsTruthy(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return false;
            }

            value = value.Trim();
            return value == "1"
                || value.Equals("true", StringComparison.OrdinalIgnoreCase)
                || value.Equals("yes", StringComparison.OrdinalIgnoreCase);
        }

        private static string ResolveDiscordExecutable(string explicitPath)
        {
            if (!string.IsNullOrWhiteSpace(explicitPath))
            {
                if (!File.Exists(explicitPath))
                {
                    throw new FileNotFoundException("CLAW_DISCORD_EXE points to a missing file.", explicitPath);
                }
                return Path.GetFullPath(explicitPath);
            }

            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            DiscordChannel[] channels =
            {
                new DiscordChannel("Stable", Path.Combine(localAppData, "Discord"), "Discord.exe"),
                new DiscordChannel("PTB", Path.Combine(localAppData, "DiscordPTB"), "DiscordPTB.exe"),
                new DiscordChannel("Canary", Path.Combine(localAppData, "DiscordCanary"), "DiscordCanary.exe")
            };

            foreach (DiscordChannel channel in channels)
            {
                if (!Directory.Exists(channel.Root))
                {
                    continue;
                }

                IEnumerable<string> appDirs = Directory.GetDirectories(channel.Root, "app-*")
                    .OrderByDescending(Path.GetFileName);

                foreach (string appDir in appDirs)
                {
                    string candidate = Path.Combine(appDir, channel.ExeName);
                    if (File.Exists(candidate))
                    {
                        return candidate;
                    }
                }
            }

            throw new FileNotFoundException("Could not find Discord Stable/PTB/Canary. Set CLAW_DISCORD_EXE to the full Discord executable path.");
        }

        private static void StopDiscordProcesses()
        {
            string[] names = { "Discord", "DiscordPTB", "DiscordCanary" };
            List<Process> processes = new List<Process>();

            foreach (string name in names)
            {
                try
                {
                    processes.AddRange(Process.GetProcessesByName(name));
                }
                catch
                {
                    // Ignore process enumeration races.
                }
            }

            if (processes.Count == 0)
            {
                PrintSubStep("No running Discord process found");
                return;
            }

            PrintSubStep(string.Format("Closing {0} Discord process(es)", processes.Count));
            foreach (Process process in processes)
            {
                try
                {
                    process.Kill();
                }
                catch
                {
                    // Some child processes may exit while we iterate.
                }
                finally
                {
                    process.Dispose();
                }
            }
        }

        private static void AssertDebugPortAvailable(int port)
        {
            if (CanBindDebugPort(port))
            {
                return;
            }

            int[] listenerPids = GetPortListenerPids(port).Distinct().ToArray();
            if (listenerPids.Length == 0)
            {
                throw new InvalidOperationException(string.Format("Debug port {0} is already in use. Set CLAW_DEBUG_PORT to another port or stop the process using it.", port));
            }

            List<string> foreignListeners = new List<string>();
            foreach (int pid in listenerPids)
            {
                try
                {
                    using (Process process = Process.GetProcessById(pid))
                    {
                        if (!IsDiscordProcess(process))
                        {
                            foreignListeners.Add(string.Format("{0} ({1})", process.ProcessName, pid));
                        }
                    }
                }
                catch
                {
                    foreignListeners.Add("pid " + pid);
                }
            }

            if (foreignListeners.Count > 0)
            {
                throw new InvalidOperationException(string.Format("Debug port {0} is already in use by non-Discord process(es): {1}. Set CLAW_DEBUG_PORT to another port or stop that process.", port, string.Join(", ", foreignListeners)));
            }

            PrintSubStep(string.Format("Debug port {0} is occupied by an existing Discord session; it will be restarted", port));
        }

        private static async Task WaitForDebugPortFreeAsync(int port, TimeSpan timeout)
        {
            DateTime deadline = DateTime.UtcNow + timeout;
            while (DateTime.UtcNow < deadline)
            {
                if (CanBindDebugPort(port))
                {
                    return;
                }

                await Task.Delay(300);
            }

            throw new InvalidOperationException(string.Format("Debug port {0} is still busy after closing Discord.", port));
        }

        private static bool CanBindDebugPort(int port)
        {
            try
            {
                TcpListener listener = new TcpListener(IPAddress.Loopback, port);
                listener.Start();
                listener.Stop();
                return true;
            }
            catch (SocketException)
            {
                return false;
            }
        }

        private static IReadOnlyList<int> GetPortListenerPids(int port)
        {
            List<int> pids = new List<int>();
            try
            {
                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    FileName = GetSystemExecutablePath("netstat.exe"),
                    Arguments = "-ano -p tcp",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };

                using (Process process = Process.Start(startInfo))
                {
                    if (process == null)
                    {
                        return pids;
                    }

                    string output = process.StandardOutput.ReadToEnd();
                    if (!process.WaitForExit(3000))
                    {
                        try { process.Kill(); } catch { }
                    }

                    string[] lines = output.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (string line in lines)
                    {
                        string[] parts = line.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
                        if (parts.Length < 5 || !parts[0].Equals("TCP", StringComparison.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        if (!parts[3].Equals("LISTENING", StringComparison.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        if (!parts[1].EndsWith(":" + port, StringComparison.Ordinal))
                        {
                            continue;
                        }

                        int pid;
                        if (int.TryParse(parts[parts.Length - 1], out pid))
                        {
                            pids.Add(pid);
                        }
                    }
                }
            }
            catch
            {
                // Best effort: the caller still reports that the port is busy.
            }

            return pids;
        }

        private static string GetSystemExecutablePath(string fileName)
        {
            string systemRoot = Environment.GetFolderPath(Environment.SpecialFolder.System);
            string fullPath = Path.Combine(systemRoot, fileName);
            if (File.Exists(fullPath))
            {
                return fullPath;
            }

            throw new FileNotFoundException("Could not resolve required Windows system executable.", fullPath);
        }

        private static bool IsDiscordProcess(Process process)
        {
            string[] names = { "Discord", "DiscordPTB", "DiscordCanary" };
            if (names.Contains(process.ProcessName, StringComparer.OrdinalIgnoreCase))
            {
                return true;
            }

            try
            {
                string path = process.MainModule == null ? "" : process.MainModule.FileName;
                return path.IndexOf("\\Discord", StringComparison.OrdinalIgnoreCase) >= 0
                    && Path.GetFileName(path).StartsWith("Discord", StringComparison.OrdinalIgnoreCase);
            }
            catch
            {
                return false;
            }
        }

        private const uint CREATE_NEW_CONSOLE = 0x00000010;
        private const int STARTF_USESHOWWINDOW = 0x00000001;
        private const short SW_HIDE = 0;

        private static void StartDiscord(string discordPath, int debugPort)
        {
            // Give Discord its OWN hidden console via CREATE_NEW_CONSOLE + SW_HIDE.
            // This is what actually stops the log spam. Electron/Chromium, when it has no
            // console of its own, calls AttachConsole(ATTACH_PARENT_PROCESS) and hijacks the
            // launcher's console to print into. That is why UseShellExecute=true and even
            // DETACHED_PROCESS did NOT help: the parent-console attach happens regardless of
            // handle inheritance. Handing Discord a brand-new (hidden) console gives it
            // somewhere else to log, so:
            //   1. Discord's logs never reach the loader window, and
            //   2. Discord no longer shares our console, so closing the loader can't kill it.
            string commandLine = string.Format(
                "\"{0}\" --remote-debugging-port={1} --remote-allow-origins=*",
                discordPath, debugPort);

            STARTUPINFO startupInfo = new STARTUPINFO();
            startupInfo.cb = Marshal.SizeOf(typeof(STARTUPINFO));
            startupInfo.dwFlags = STARTF_USESHOWWINDOW;
            startupInfo.wShowWindow = SW_HIDE;   // keep the new console hidden

            PROCESS_INFORMATION processInfo;
            bool started = CreateProcess(
                null,
                commandLine,
                IntPtr.Zero,
                IntPtr.Zero,
                false,                // don't inherit our handles
                CREATE_NEW_CONSOLE,   // Discord gets its own console (hidden) to log into
                IntPtr.Zero,
                Path.GetDirectoryName(discordPath),
                ref startupInfo,
                out processInfo);

            if (!started)
            {
                throw new InvalidOperationException(
                    "Failed to start Discord (CreateProcess error " + Marshal.GetLastWin32Error() + ").");
            }

            CloseHandle(processInfo.hThread);
            CloseHandle(processInfo.hProcess);

            PrintSubStep("Remote debugging port: " + debugPort);
        }

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern bool CreateProcess(
            string lpApplicationName,
            string lpCommandLine,
            IntPtr lpProcessAttributes,
            IntPtr lpThreadAttributes,
            bool bInheritHandles,
            uint dwCreationFlags,
            IntPtr lpEnvironment,
            string lpCurrentDirectory,
            ref STARTUPINFO lpStartupInfo,
            out PROCESS_INFORMATION lpProcessInformation);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool CloseHandle(IntPtr hObject);

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        private struct STARTUPINFO
        {
            public int cb;
            public string lpReserved;
            public string lpDesktop;
            public string lpTitle;
            public int dwX;
            public int dwY;
            public int dwXSize;
            public int dwYSize;
            public int dwXCountChars;
            public int dwYCountChars;
            public int dwFillAttribute;
            public int dwFlags;
            public short wShowWindow;
            public short cbReserved2;
            public IntPtr lpReserved2;
            public IntPtr hStdInput;
            public IntPtr hStdOutput;
            public IntPtr hStdError;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct PROCESS_INFORMATION
        {
            public IntPtr hProcess;
            public IntPtr hThread;
            public int dwProcessId;
            public int dwThreadId;
        }

        private static async Task<DevToolsTarget> WaitForDiscordTargetAsync(int debugPort)
        {
            DevToolsTarget stableTarget = null;
            string stableUrl = null;
            DateTime? stableSince = null;
            DateTime deadline = DateTime.UtcNow + DiscordTargetTimeout;
            DateTime lastProgress = DateTime.MinValue;

            while (DateTime.UtcNow < deadline)
            {
                try
                {
                    IReadOnlyList<DevToolsTarget> targets = await GetDevToolsTargetsAsync(debugPort);
                    DevToolsTarget[] candidates = targets
                        .Where(t => !string.IsNullOrWhiteSpace(t.WebSocketDebuggerUrl))
                        .Where(t => IsDiscordAppUrl(t.Url))
                        .ToArray();

                    DevToolsTarget candidate = candidates.FirstOrDefault(t => t.Url.StartsWith("https://discord.com/channels", StringComparison.OrdinalIgnoreCase))
                        ?? candidates.FirstOrDefault();

                    if (candidate != null)
                    {
                        string candidateUrl = candidate.Url.Trim();
                        if (!string.Equals(stableUrl, candidateUrl, StringComparison.Ordinal))
                        {
                            stableTarget = candidate;
                            stableUrl = candidateUrl;
                            stableSince = DateTime.UtcNow;
                            PrintSubStep("Observed target: " + candidateUrl);
                            lastProgress = DateTime.UtcNow;
                        }
                        else
                        {
                            stableTarget = candidate;
                            if ((DateTime.UtcNow - lastProgress).TotalSeconds >= 5)
                            {
                                PrintSubStep("Still waiting on: " + candidateUrl);
                                lastProgress = DateTime.UtcNow;
                            }
                        }

                        if (stableTarget != null && stableSince.HasValue && DateTime.UtcNow - stableSince.Value >= StableTargetDelay)
                        {
                            return stableTarget;
                        }
                    }
                    else if ((DateTime.UtcNow - lastProgress).TotalSeconds >= 5)
                    {
                        PrintSubStep("Waiting for discord.com app target...");
                        lastProgress = DateTime.UtcNow;
                    }
                }
                catch
                {
                    // Discord may not have opened the DevTools endpoint yet.
                }

                await Task.Delay(1000);
            }

            throw new TimeoutException(string.Format("Discord did not finish loading a ready app page on port {0} within {1:N0} seconds.", debugPort, DiscordTargetTimeout.TotalSeconds));
        }

        private static bool IsDiscordAppUrl(string url)
        {
            return !string.IsNullOrWhiteSpace(url)
                && (url.StartsWith("https://discord.com/app", StringComparison.OrdinalIgnoreCase)
                    || url.StartsWith("https://discord.com/channels", StringComparison.OrdinalIgnoreCase));
        }

        private static async Task<IReadOnlyList<DevToolsTarget>> GetDevToolsTargetsAsync(int port)
        {
            string json = await Http.GetStringAsync(string.Format("http://127.0.0.1:{0}/json", port));
            object parsed = Json.DeserializeObject(json);
            object[] array = parsed as object[];

            if (array == null)
            {
                IDictionary<string, object> wrapper = parsed as IDictionary<string, object>;
                object value;
                if (wrapper != null && wrapper.TryGetValue("value", out value))
                {
                    array = value as object[];
                }
            }

            List<DevToolsTarget> targets = new List<DevToolsTarget>();
            if (array == null)
            {
                return targets;
            }

            foreach (object item in array)
            {
                IDictionary<string, object> dict = item as IDictionary<string, object>;
                if (dict == null)
                {
                    continue;
                }

                targets.Add(new DevToolsTarget
                {
                    Type = GetString(dict, "type"),
                    Url = GetString(dict, "url"),
                    Title = GetString(dict, "title"),
                    WebSocketDebuggerUrl = GetString(dict, "webSocketDebuggerUrl")
                });
            }

            return targets;
        }

        private static async Task<IDictionary<string, object>> EvaluateAsync(string webSocketUrl, string expression, bool returnByValue)
        {
            using (ClientWebSocket ws = new ClientWebSocket())
            using (CancellationTokenSource cts = new CancellationTokenSource(DevToolsTimeout))
            {
                await ws.ConnectAsync(new Uri(webSocketUrl), cts.Token);

                Dictionary<string, object> request = new Dictionary<string, object>
                {
                    { "id", 1 },
                    { "method", "Runtime.evaluate" },
                    { "params", new Dictionary<string, object>
                        {
                            { "expression", expression },
                            { "awaitPromise", false },
                            { "returnByValue", returnByValue }
                        }
                    }
                };

                byte[] bytes = Encoding.UTF8.GetBytes(Json.Serialize(request));
                await ws.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, cts.Token);

                while (true)
                {
                    IDictionary<string, object> root = await ReceiveJsonAsync(ws, cts.Token);

                    int id;
                    if (!TryGetInt(root, "id", out id) || id != 1)
                    {
                        continue;
                    }

                    IDictionary<string, object> error = GetDictionary(root, "error");
                    if (error != null)
                    {
                        string message = GetString(error, "message");
                        throw new InvalidOperationException("DevTools error: " + (string.IsNullOrWhiteSpace(message) ? Json.Serialize(error) : message));
                    }

                    IDictionary<string, object> result = GetDictionary(root, "result");
                    if (result != null && GetDictionary(result, "exceptionDetails") != null)
                    {
                        throw new InvalidOperationException(ExtractExceptionMessage(GetDictionary(result, "exceptionDetails")));
                    }

                    return root;
                }
            }
        }

        private static async Task<IDictionary<string, object>> ReceiveJsonAsync(ClientWebSocket ws, CancellationToken cancellationToken)
        {
            byte[] buffer = new byte[64 * 1024];
            using (MemoryStream stream = new MemoryStream())
            {
                while (true)
                {
                    WebSocketReceiveResult result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), cancellationToken);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        throw new WebSocketException("DevTools WebSocket closed before returning a Runtime.evaluate response.");
                    }

                    stream.Write(buffer, 0, result.Count);
                    if (result.EndOfMessage)
                    {
                        break;
                    }
                }

                string json = Encoding.UTF8.GetString(stream.ToArray());
                IDictionary<string, object> dict = Json.DeserializeObject(json) as IDictionary<string, object>;
                if (dict == null)
                {
                    throw new InvalidOperationException("DevTools returned a non-object JSON response.");
                }

                return dict;
            }
        }

        private static string ExtractExceptionMessage(IDictionary<string, object> details)
        {
            IDictionary<string, object> exception = GetDictionary(details, "exception");
            string description = exception == null ? "" : GetString(exception, "description");
            if (!string.IsNullOrWhiteSpace(description))
            {
                return description;
            }

            string text = GetString(details, "text");
            if (!string.IsNullOrWhiteSpace(text))
            {
                return text;
            }

            return "Runtime.evaluate failed with exceptionDetails.";
        }

        private static string DescribeVerification(IDictionary<string, object> document)
        {
            try
            {
                IDictionary<string, object> outerResult = GetDictionary(document, "result");
                IDictionary<string, object> innerResult = outerResult == null ? null : GetDictionary(outerResult, "result");
                IDictionary<string, object> value = innerResult == null ? null : GetDictionary(innerResult, "value");

                if (value == null)
                {
                    return "verification response received";
                }

                bool locked = GetBool(value, "lock");
                bool ui = GetBool(value, "ui");
                string url = GetString(value, "url");
                return string.Format("lock={0}, ui={1}, url={2}", locked, ui, url);
            }
            catch
            {
                return "verification response received";
            }
        }

        private static IDictionary<string, object> GetDictionary(IDictionary<string, object> dict, string key)
        {
            if (dict == null)
            {
                return null;
            }

            object value;
            return dict.TryGetValue(key, out value) ? value as IDictionary<string, object> : null;
        }

        private static string GetString(IDictionary<string, object> dict, string key)
        {
            if (dict == null)
            {
                return "";
            }

            object value;
            return dict.TryGetValue(key, out value) && value != null ? Convert.ToString(value) : "";
        }

        private static bool GetBool(IDictionary<string, object> dict, string key)
        {
            if (dict == null)
            {
                return false;
            }

            object value;
            if (!dict.TryGetValue(key, out value) || value == null)
            {
                return false;
            }

            if (value is bool)
            {
                return (bool)value;
            }

            bool parsed;
            return bool.TryParse(Convert.ToString(value), out parsed) && parsed;
        }

        private static bool TryGetInt(IDictionary<string, object> dict, string key, out int value)
        {
            value = 0;
            if (dict == null)
            {
                return false;
            }

            object raw;
            if (!dict.TryGetValue(key, out raw) || raw == null)
            {
                return false;
            }

            try
            {
                value = Convert.ToInt32(raw);
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static void PrintLogo()
        {
            try
            {
                Console.Clear();
                Console.WindowWidth = Math.Min(80, Math.Max(Console.WindowWidth, 60));
                Console.BufferWidth = Math.Min(120, Math.Max(Console.BufferWidth, 80));
            }
            catch
            {
                // Console sizing is best effort.
            }

            Console.ForegroundColor = ConsoleColor.Magenta;
            Console.WriteLine("   ______   __       ___   _       __");
            Console.WriteLine("  / ____/  / /      /   | | |     / /");
            Console.WriteLine(" / /      / /      / /| | | | /| / / ");
            Console.WriteLine("/ /___   / /___   / ___ | | |/ |/ /  ");
            Console.WriteLine("\\____/  /_____/  /_/  |_| |__/|__/   ");
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.WriteLine("============================================================");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("             Cloud Auto-Injector");
            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.WriteLine("============================================================");
            Console.ResetColor();
            Console.WriteLine();
        }

        private static void PrintStep(string step, string message)
        {
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.Write(step + " ");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine(message);
            Console.ResetColor();
        }

        private static void PrintSubStep(string message)
        {
            // Keep the loader UI clean: only top-level steps are printed.
        }

        private static void PrintError(string message)
        {
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Red;
            Console.Write("[ERROR] ");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine(message);
            Console.ResetColor();
            Console.WriteLine();
        }

        private static void PrintWarning(string message)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.Write("[WARN] ");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine(message);
            Console.ResetColor();
        }

        private static void PrintSuccess(string message)
        {
            Console.WriteLine();
            Console.ForegroundColor = ConsoleColor.Green;
            Console.Write("[SUCCESS] ");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine(message);
            Console.ResetColor();
        }

        private static void AutoClose()
        {
            Pause(false);
        }

        private static void Pause(bool forceWait)
        {
            try
            {
                if (forceWait && !Console.IsInputRedirected)
                {
                    Console.WriteLine("Press any key to exit...");
                    Console.ReadKey(true);
                }
                else
                {
                    Thread.Sleep(5000);
                }
            }
            catch
            {
                Thread.Sleep(5000);
            }
        }

        private sealed class DiscordChannel
        {
            public DiscordChannel(string name, string root, string exeName)
            {
                Name = name;
                Root = root;
                ExeName = exeName;
            }

            public string Name { get; private set; }
            public string Root { get; private set; }
            public string ExeName { get; private set; }
        }

        private sealed class DevToolsTarget
        {
            public string Type { get; set; }
            public string Url { get; set; }
            public string Title { get; set; }
            public string WebSocketDebuggerUrl { get; set; }
        }

        private sealed class VersionManifest
        {
            public string Version { get; set; }
            public string PayloadSha256 { get; set; }
            public string LoaderSha256 { get; set; }
            public string ReleaseUrl { get; set; }

            public static VersionManifest Parse(IDictionary<string, object> dict)
            {
                if (dict == null)
                {
                    return null;
                }

                return new VersionManifest
                {
                    Version = GetString(dict, "version"),
                    PayloadSha256 = GetString(dict, "payloadSha256"),
                    LoaderSha256 = GetString(dict, "loaderSha256"),
                    ReleaseUrl = GetString(dict, "releaseUrl")
                };
            }
        }

        private sealed class LoaderOptions
        {
            public int DebugPort { get; private set; }
            public string DiscordExe { get; private set; }

            public static LoaderOptions Parse(string[] args)
            {
                int debugPort = ParseInt(Environment.GetEnvironmentVariable("CLAW_DEBUG_PORT")) ?? DefaultDebugPort;
                string discordExe = Environment.GetEnvironmentVariable("CLAW_DISCORD_EXE");

                for (int i = 0; i < args.Length; i++)
                {
                    string arg = args[i];
                    if (i == 0 && arg.Equals("cloud", StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    if (arg.Equals("local", StringComparison.OrdinalIgnoreCase))
                    {
                        throw new ArgumentException("Local payload mode was removed. Claw.exe is a cloud loader.");
                    }

                    switch (arg)
                    {
                        case "--mode":
                            if (i + 1 >= args.Length) throw new ArgumentException("Missing value for --mode.");
                            string mode = args[++i];
                            if (!mode.Equals("cloud", StringComparison.OrdinalIgnoreCase))
                            {
                                throw new ArgumentException("Only cloud mode is supported.");
                            }
                            break;
                        case "--port":
                            if (i + 1 >= args.Length) throw new ArgumentException("Missing value for --port.");
                            int? parsedPort = ParseInt(args[++i]);
                            if (!parsedPort.HasValue) throw new ArgumentException("Port must be a number.");
                            debugPort = parsedPort.Value;
                            break;
                        case "--discord-exe":
                            if (i + 1 >= args.Length) throw new ArgumentException("Missing value for --discord-exe.");
                            discordExe = args[++i];
                            break;
                    }
                }

                return new LoaderOptions
                {
                    DebugPort = debugPort,
                    DiscordExe = discordExe
                };
            }

            private static int? ParseInt(string value)
            {
                int parsed;
                return int.TryParse(value, out parsed) ? parsed : (int?)null;
            }
        }

    }
}
