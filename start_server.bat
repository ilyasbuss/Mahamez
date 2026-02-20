@echo off
set "PROJECT_ROOT=%~dp0"
set "NODE_DIR=%PROJECT_ROOT%tools\node-v22.13.1-win-x64"
set "PATH=%NODE_DIR%;%PATH%"

echo Checking environment...
echo Node Version:
"%NODE_DIR%\node.exe" -v

cd /d "%PROJECT_ROOT%"

if not exist "node_modules\" (
    echo [INFO] node_modules not found. Running setup...
    call "%NODE_DIR%\npm.cmd" run setup
)

if not exist "backend\node_modules\" (
    echo [INFO] backend node_modules not found. Running backend setup...
    call "%NODE_DIR%\npm.cmd" run setup:backend
)

echo Starting Development Server...
call "%NODE_DIR%\npm.cmd" run dev
pause
