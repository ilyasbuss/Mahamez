@echo off
setlocal enabledelayedexpansion

set "PROJECT_ROOT=%~dp0"
set "NODE_DIR=%PROJECT_ROOT%tools\node-v22.13.1-win-x64"

if not exist "%NODE_DIR%\node.exe" (
    echo [ERROR] Bundled Node.js not found in %NODE_DIR%
    pause
    exit /b 1
)

set "PATH=%NODE_DIR%;%PATH%"

echo [INFO] Checking ports 3000 and 8000...
for %%P in (3000 8000) do (
    for /f "tokens=5" %%A in ('netstat -aon ^| findstr :%%P ^| findstr LISTENING') do (
        echo [INFO] Port %%P is in use by PID %%A. Terminating...
        taskkill /F /PID %%A >nul 2>&1
    )
)

echo [INFO] Using Node Version:
node -v

cd /d "%PROJECT_ROOT%"

if not exist "node_modules\" (
    echo [INFO] node_modules not found. Running full setup...
    call npm run setup
) else (
    if not exist "backend\node_modules\" (
        echo [INFO] backend node_modules not found. Running backend setup...
        cd backend && call npm install && cd ..
    )
)

:: Check if better-sqlite3 needs a rebuild (simple heuristic: if node version changed)
:: For now, we rely on the manual setup:backend if it fails, but we can be more proactive here if needed.

echo [INFO] Starting Development Server...
call npm run dev
pause
