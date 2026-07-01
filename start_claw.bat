@echo off
setlocal
chcp 65001 >nul 2>&1


set "PAYLOAD_URL=https://raw.githubusercontent.com/l-limon-l/Claw/main/index.js"
set "DEBUG_PORT=10222"
set "PS_FILE=%TEMP%\claw_inject.ps1"
set "VBS_FILE=%TEMP%\claw_launcher.vbs"

echo ========================================================
echo          Claw Auto-Injector (Cloud Edition)
echo ========================================================
echo.

echo [1/4] Closing Discord...
taskkill /F /IM discord.exe /T >nul 2>&1
powershell -noprofile -command "Start-Sleep -Seconds 2"

echo [2/4] Starting Discord in Debug Mode...
set "DISCORD_DIR=%LocalAppData%\Discord"
set "DISCORD_EXE="
for /d %%D in ("%DISCORD_DIR%\app-*") do (
    if exist "%%D\Discord.exe" set "DISCORD_EXE=%%D\Discord.exe"
)

if "%DISCORD_EXE%"=="" (
    echo Error: Could not find Discord.exe
    pause
    exit /b 1
)


> "%VBS_FILE%" echo Set objShell = WScript.CreateObject("WScript.Shell")
>> "%VBS_FILE%" echo objShell.Run """%DISCORD_EXE%"" --remote-debugging-port=%DEBUG_PORT%", 1, False
cscript //nologo "%VBS_FILE%"
del "%VBS_FILE%" >nul 2>&1

echo [3/4] Waiting for Discord to load (12 seconds)...
powershell -noprofile -command "Start-Sleep -Seconds 12"

echo [4/4] Injecting Claw Payload...

> "%PS_FILE%" echo $ErrorActionPreference = 'Stop'
>> "%PS_FILE%" echo [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
>> "%PS_FILE%" echo $port = %DEBUG_PORT%
>> "%PS_FILE%" echo $url = '%PAYLOAD_URL%'
>> "%PS_FILE%" echo Write-Host "Downloading payload from GitHub..."
>> "%PS_FILE%" echo try { $code = Invoke-RestMethod -Uri $url -UseBasicParsing } catch { Write-Host "Failed to download payload."; exit 1 }
>> "%PS_FILE%" echo Write-Host "Connecting to Discord..."
>> "%PS_FILE%" echo $target = $null
>> "%PS_FILE%" echo for ($i=0; $i -lt 15; $i++) {
>> "%PS_FILE%" echo     try {
>> "%PS_FILE%" echo         $json = Invoke-RestMethod -Uri "http://127.0.0.1:$port/json" -UseBasicParsing
>> "%PS_FILE%" echo         $target = $json ^| Where-Object { $_.url -match 'discord.com/(app^|channels)' } ^| Select-Object -First 1
>> "%PS_FILE%" echo         if ($target) { break }
>> "%PS_FILE%" echo     } catch { }
>> "%PS_FILE%" echo     Start-Sleep -Seconds 2
>> "%PS_FILE%" echo }
>> "%PS_FILE%" echo if (-not $target) { Write-Host "Could not find Discord debug window. Discord might not be fully loaded."; exit 1 }
>> "%PS_FILE%" echo $wsUrl = $target.webSocketDebuggerUrl
>> "%PS_FILE%" echo $payloadObj = @{ id = 1; method = 'Runtime.evaluate'; params = @{ expression = $code } }
>> "%PS_FILE%" echo $payload = $payloadObj ^| ConvertTo-Json -Depth 10 -Compress
>> "%PS_FILE%" echo $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
>> "%PS_FILE%" echo $segment = New-Object System.ArraySegment[byte] -ArgumentList @(,$bytes)
>> "%PS_FILE%" echo $ws = New-Object System.Net.WebSockets.ClientWebSocket
>> "%PS_FILE%" echo $ct = New-Object System.Threading.CancellationToken
>> "%PS_FILE%" echo $task = $ws.ConnectAsync((New-Object Uri($wsUrl)), $ct); $task.Wait()
>> "%PS_FILE%" echo $task = $ws.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $ct); $task.Wait()
>> "%PS_FILE%" echo Start-Sleep -Milliseconds 500
>> "%PS_FILE%" echo try { $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'Done', $ct).Wait() } catch { }
>> "%PS_FILE%" echo Write-Host "Injection successful! Discord is now running with Claw."

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_FILE%"

del "%PS_FILE%" >nul 2>&1
echo.
pause
exit /b
