@echo off
set "PROJECT_ROOT=%~dp0"
set "NODE_DIR=%PROJECT_ROOT%tools\node-v22.13.1-win-x64"
set "PATH=%NODE_DIR%;%PATH%"

echo Starting Development Server...
echo Node Version:
"%NODE_DIR%\node.exe" -v

cd /d "%PROJECT_ROOT%"
"%NODE_DIR%\npm" run dev
pause
