@echo off
chcp 65001 > nul
title Discord Console Activator
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "Green=%ESC%[32m"
set "Blue=%ESC%[94m"
set "Purple=%ESC%[35m"
set "Reset=%ESC%[0m"
echo.
echo %Purple%  ======================================%Reset%
echo %Purple%         Discord Console Activator      %Reset%
echo %Purple%  ======================================%Reset%
echo.
echo %Blue%  [*]%Reset% Closing Discord processes...
taskkill /f /im Discord.exe >nul 2>&1
taskkill /f /im DiscordCanary.exe >nul 2>&1
taskkill /f /im DiscordPTB.exe >nul 2>&1
timeout /t 2 /nobreak > nul
echo %Blue%  [*]%Reset% Patching configuration files...
set "PS_SCRIPT=%TEMP%\enable_devtools.ps1"
echo $versions = @('discord', 'discordcanary', 'discordptb') > "%PS_SCRIPT%"
echo foreach ($ver in $versions) { >> "%PS_SCRIPT%"
echo     $path = "$env:APPDATA\$ver\settings.json" >> "%PS_SCRIPT%"
echo     if (Test-Path $path) { >> "%PS_SCRIPT%"
echo         Write-Host "      - Patched $ver" -ForegroundColor DarkGray >> "%PS_SCRIPT%"
echo         $json = Get-Content -Raw -Path $path ^| ConvertFrom-Json >> "%PS_SCRIPT%"
echo         $json ^| Add-Member -MemberType NoteProperty -Name 'DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING' -Value $true -Force >> "%PS_SCRIPT%"
echo         [System.IO.File]::WriteAllText($path, ($json ^| ConvertTo-Json -Depth 10)) >> "%PS_SCRIPT%"
echo     } >> "%PS_SCRIPT%"
echo } >> "%PS_SCRIPT%"
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%"
del "%PS_SCRIPT%"
echo %Blue%  [*]%Reset% Restarting Discord...
if exist "%LOCALAPPDATA%\Discord\Update.exe" (
    start "" "%LOCALAPPDATA%\Discord\Update.exe" --processStart Discord.exe
)
if exist "%LOCALAPPDATA%\DiscordCanary\Update.exe" (
    start "" "%LOCALAPPDATA%\DiscordCanary\Update.exe" --processStart DiscordCanary.exe
)
if exist "%LOCALAPPDATA%\DiscordPTB\Update.exe" (
    start "" "%LOCALAPPDATA%\DiscordPTB\Update.exe" --processStart DiscordPTB.exe
)
echo.
echo %Green%  [+]%Reset% Done! Developer Tools are now enabled.
timeout /t 3 > nul
