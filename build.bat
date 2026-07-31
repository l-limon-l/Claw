@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================
echo   CLAW - Full Auto-Build ^& Hash Update
echo ============================================
echo.

echo [1/4] Bundling index.js...
if exist "node_modules\@esbuild\win32-x64\esbuild.exe" (
    ".\node_modules\@esbuild\win32-x64\esbuild.exe" src/main.js --bundle --outfile=index.js --format=iife --target=es2020
) else (
    call npm run build
)
if errorlevel 1 goto :error

echo.
echo [2/4] Compiling loader-csharp\bin\Release\net48\Claw.exe...
set "CSC=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if exist "%CSC%" (
    "%CSC%" /nologo /target:exe /out:loader-csharp\bin\Release\net48\Claw.exe /reference:System.Net.Http.dll /reference:System.Web.Extensions.dll /win32icon:loader-csharp\app.ico loader-csharp\Program.cs
) else (
    dotnet build loader-csharp\ClawInjector.csproj -c Release
)
if errorlevel 1 goto :error

echo.
echo [3/4] Updating latest.json hashes...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$payloadHash = (Get-FileHash -Path 'index.js' -Algorithm SHA256).Hash.ToLower(); $loaderHash = (Get-FileHash -Path 'loader-csharp\bin\Release\net48\Claw.exe' -Algorithm SHA256).Hash.ToLower(); $jsonContent = Get-Content -Raw -Path 'latest.json' | ConvertFrom-Json; $jsonContent.payloadSha256 = $payloadHash; $jsonContent.loaderSha256 = $loaderHash; $jsonContent | ConvertTo-Json -Depth 5 | Set-Content -Path 'latest.json' -Encoding UTF8; Write-Host ('   payloadSha256: ' + $payloadHash); Write-Host ('   loaderSha256:  ' + $loaderHash);"
if errorlevel 1 goto :error

echo.
echo ============================================
echo [4/4] SUCCESS! Build ^& latest.json updated.
echo.
echo  - Payload: index.js
echo  - Loader:  loader-csharp\bin\Release\net48\Claw.exe
echo ============================================
echo.
exit /b 0

:error
echo.
echo *** BUILD FAILED - see error messages above ***
echo.
pause
exit /b 1
