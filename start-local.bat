@echo off
title AgriComply AI - Launcher
echo ========================================================
echo          AgriComply AI - 1-Click Startup Launcher
echo ========================================================

set NODE_DIR=C:\Users\srijan\AppData\Local\nodejs\node-v22.17.0-win-x64
set NODE_EXE=%NODE_DIR%\node.exe
set PYTHON_EXE=C:\Python313\python.exe
set PATH=%NODE_DIR%;%PATH%

echo.
echo [1/3] Starting Python ML Service (port 5001)...
start "AgriComply ML Service (Port 5001)" cmd /k "cd /d %~dp0ml_service && %PYTHON_EXE% app.py"

echo Waiting 3 seconds for ML service to initialize...
timeout /t 3 /nobreak > nul

echo.
echo [2/3] Starting Node.js API Server (port 5000)...
start "AgriComply Node Server (Port 5000)" cmd /k "cd /d %~dp0server && %NODE_EXE% app.js"

echo Waiting 2 seconds for Node server to initialize...
timeout /t 2 /nobreak > nul

echo.
echo [3/3] Starting React Frontend Client (port 3000)...
start "AgriComply Client (Port 3000)" cmd /k "cd /d %~dp0client && set PATH=%NODE_DIR%;%%PATH%% && npm run dev"

echo.
echo ========================================================
echo  All 3 services launched successfully!
echo  -------------------------------------------------------
echo  - Frontend Web UI:  http://localhost:3000
echo  - Backend API:      http://localhost:5000
echo  - Python ML Engine: http://localhost:5001
echo ========================================================
echo.
echo Opening browser...
start http://localhost:3000
echo.
echo (Keep the opened terminal windows running while using the app)
echo Press any key to close this launcher window.
pause > nul
