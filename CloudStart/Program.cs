using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace ClawInjector
{
	internal class Program
	{
		private static void Main(string[] args)
		{
			if (args.Length == 0 || args[0] != "--conhost")
			{
				Process.Start(new ProcessStartInfo
				{
					FileName = "conhost.exe",
					Arguments = "\"" + Process.GetCurrentProcess().MainModule.FileName + "\" --conhost",
					UseShellExecute = false
				});
				return;
			}
			Program.MainAsync(args).GetAwaiter().GetResult();
		}

		private static void PrintLogo()
		{
			try
			{
				Console.Clear();
				Console.WindowWidth = 60;
				Console.BufferWidth = 60;
				Console.WindowHeight = 20;
				Console.BufferHeight = 20;
			}
			catch
			{
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
			Console.WriteLine("               Cloud Auto-Injector (Edition)                ");
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
			Console.ForegroundColor = ConsoleColor.DarkGray;
			Console.Write("      -> ");
			Console.ForegroundColor = ConsoleColor.Gray;
			Console.WriteLine(message);
			Console.ResetColor();
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
			Console.WriteLine("Press any key to exit...");
			Program.Pause(true);
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

		private static async Task MainAsync(string[] args)
		{
			Console.OutputEncoding = Encoding.UTF8;
			Console.Title = "Claw Auto-Injector";
			Program.PrintLogo();
			Program.PrintStep("[1/4]", "Closing Discord...");
			foreach (Process process in Process.GetProcessesByName("Discord"))
			{
				try
				{
					process.Kill();
				}
				catch
				{
				}
			}
			await Task.Delay(2000);
			Program.PrintStep("[2/4]", "Starting Discord in Debug Mode...");
			string text = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Discord");
			if (!Directory.Exists(text))
			{
				Program.PrintError("Could not find Discord installation folder.");
			}
			else
			{
				string text2 = (from f in (from d in Directory.GetDirectories(text, "app-*")
						select Path.Combine(d, "Discord.exe")).Where(new Func<string, bool>(File.Exists))
					orderby f descending
					select f).FirstOrDefault<string>();
				if (string.IsNullOrEmpty(text2))
				{
					Program.PrintError("Could not find Discord.exe");
				}
				else
				{
					Process.Start(new ProcessStartInfo
					{
						FileName = "cmd.exe",
						// Фикс 1: Добавляем разрешение на кросс-ориджин запросы для дебаг-порта
						Arguments = string.Format("/c start \"\" \"{0}\" --remote-debugging-port={1} --remote-allow-origins=*", text2, 10222),
						UseShellExecute = false,
						CreateNoWindow = true
					});
					Program.PrintStep("[3/4]", "Waiting for Discord to load...");
					await Task.Delay(15000);
					Program.PrintStep("[4/4]", "Injecting Claw Payload...");
					ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
					string jsCode = "";
					try
					{
						Program.PrintSubStep("Downloading payload from GitHub...");
						using (WebClient client = new WebClient())
						{
							jsCode = await client.DownloadStringTaskAsync(new Uri("https://raw.githubusercontent.com/l-limon-l/Claw/main/index.js"));
						}
					}
					catch (Exception ex)
					{
						Program.PrintError("Failed to download payload: " + ex.Message);
						return;
					}
					Program.PrintSubStep("Connecting to Discord WebSocket...");
					string wsUrl = null;
					
					for (int i = 0; i < 20; i++)
					{
						try
						{
							string text3 = "";
							using (WebClient client = new WebClient())
							{
								text3 = await client.DownloadStringTaskAsync(new Uri(string.Format("http://127.0.0.1:{0}/json", 10222)));
							}
							
							// Фикс 2: Прямой поиск ссылки вебсокета
							Match matchWS = Regex.Match(text3, "\"webSocketDebuggerUrl\"\\s*:\\s*\"(ws://[^\"]+)\"");
							if (matchWS.Success)
							{
								wsUrl = matchWS.Groups[1].Value;
								break;
							}
						}
						catch
						{
						}
						await Task.Delay(2000);
					}
					if (wsUrl == null)
					{
						Program.PrintError("Could not find Discord debug window. Discord loading took too long.");
					}
					else
					{
						try
						{
							using (ClientWebSocket ws = new ClientWebSocket())
							{
								await ws.ConnectAsync(new Uri(wsUrl), CancellationToken.None);
								string text4 = "{\"id\":1,\"method\":\"Runtime.evaluate\",\"params\":{\"expression\":\"" + jsCode.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n")
									.Replace("\r", "\\r") + "\"}}";
								await ws.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(text4)), WebSocketMessageType.Text, true, CancellationToken.None);
								await Task.Delay(500);
								try
								{
									await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Done", CancellationToken.None);
								}
								catch
								{
								}
								Program.PrintSuccess("Injection successful! Discord has Claw.");
							}
						}
						catch (Exception ex2)
						{
							Program.PrintError("Injection failed: " + ex2.Message);
							return;
						}
						Console.WriteLine();
						Console.ForegroundColor = ConsoleColor.DarkGray;
						Console.WriteLine("This window will close automatically in 5s...");
						Console.ResetColor();
						Program.Pause(false);
					}
				}
			}
		}

		private static void Pause(bool forceWait)
		{
			try
			{
				if (forceWait && !Console.IsInputRedirected)
				{
					Console.ReadKey();
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

		private const string PayloadUrl = "https://raw.githubusercontent.com/l-limon-l/Claw/main/index.js";
		private const int DebugPort = 10222;
	}
}
