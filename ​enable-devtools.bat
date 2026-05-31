@echo off
chcp 65001 > nul
title Discord Console Activator
taskkill /f /im Discord.exe 2>nul
timeout /t 2 /nobreak > nul
set "JSON_PATH=%APPDATA%\discord\settings.json"
if not exist "%JSON_PATH%" (
    exit /b
)
powershell -NoProfile -Command ^
    "$path = '%JSON_PATH%';" ^
    "$json = Get-Content -Raw -Path $path | ConvertFrom-Json;" ^
    "$json | Add-Member -MemberType NoteProperty -Name 'DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING' -Value $true -Force;" ^
    "$json | ConvertTo-Json -Depth 10 | Set-Content -Path $path"
start "" "%LOCALAPPDATA%\Discord\Update.exe" --processStart Discord.exe
timeout /t 3 > nul
