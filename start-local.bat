@echo off
title AgriComply AI - 1-Click Launcher
echo ========================================================
echo          AgriComply AI - Universal 1-Click Launcher
echo ========================================================
echo.

cd /d "%~dp0"

REM 1. Set Python Path
if exist "C:\Python313\python.exe" (
    set "PYTHON_CMD=C:\Python313\python.exe"
) else (
    set "PYTHON_CMD=python"
)

REM 2. Set Node.js & NPM Path
if exist "C:\Users\srijan\AppData\Local\nodejs\node-v22.17.0-win-x64\node.exe" (
    set "NODE_DIR=C:\Users\srijan\AppData\Local\nodejs\node-v22.17.0-win-x64"
    set "PATH=C:\Users\srijan\AppData\Local\nodejs\node-v22.17.0-win-x64;%PATH%"
    set "NODE_CMD=C:\Users\srijan\AppData\Local\nodejs\node-v22.17.0-win-x64\node.exe"
    set "NPM_CMD=C:\Users\srijan\AppData\Local\nodejs\node-v22.17.0-win-x64\npm.cmd"
) else (
    set "NODE_CMD=node"
    set "NPM_CMD=npm"
)

echo [OK] Python: %PYTHON_CMD%
echo [OK] Node:   %NODE_CMD%
echo.

REM 3. Start Python ML Microservice (Port 5001)
echo [1/3] Starting Python ML Microservice (Port 5001)...
start "AgriComply ML Service (Port 5001)" cmd /k "cd /d ""%~dp0ml_service"" && ""%PYTHON_CMD%"" app.py"

REM 4. Start Node.js API Server (Port 5000)
echo [2/3] Starting Node.js Backend API (Port 5000)...
start "AgriComply Node Server (Port 5000)" cmd /k "cd /d ""%~dp0server"" && ""%NODE_CMD%"" app.js"

REM 5. Start React Vite Frontend (Port 3000)
echo [3/3] Starting React Vite Frontend (Port 3000)...
start "AgriComply Client UI (Port 3000)" cmd /k "cd /d ""%~dp0client"" && ""%NPM_CMD%"" run dev"

echo.
echo ========================================================
echo  All 3 Services Launched Successfully!
echo  -------------------------------------------------------
echo  - Frontend Web UI:  http://localhost:3000
echo  - Backend API:      http://localhost:5000
echo  - Python ML Engine: http://localhost:5001
echo ========================================================
echo.
echo Opening browser in 1 second...
timeout /t 1 /nobreak > nul
start http://localhost:3000

echo.
echo Services are running in background windows.
timeout /t 3 /nobreak > nul
exit
