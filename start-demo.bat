@echo off
setlocal enabledelayedexpansion
title AgriComply AI - Universal 1-Click Launcher
echo ========================================================
echo          AgriComply AI - Universal 1-Click Launcher
echo ========================================================
echo.

cd /d "%~dp0"

REM 1. Detect Python
where python >nul 2>nul
if %errorlevel% equ 0 (
    set PYTHON_CMD=python
) else (
    where py >nul 2>nul
    if !errorlevel! equ 0 (
        set PYTHON_CMD=py
    ) else (
        if exist "C:\Python313\python.exe" (
            set PYTHON_CMD=C:\Python313\python.exe
        ) else (
            echo [ERROR] Python not found in PATH or C:\Python313. Please install Python 3.10+
            pause
            exit /b 1
        )
    )
)

REM 2. Detect Node.js
where node >nul 2>nul
if %errorlevel% equ 0 (
    set NODE_CMD=node
    set NPM_CMD=npm
) else (
    if exist "C:\Users\%USERNAME%\AppData\Local\nodejs\node-v22.17.0-win-x64\node.exe" (
        set NODE_DIR=C:\Users\%USERNAME%\AppData\Local\nodejs\node-v22.17.0-win-x64
        set PATH=!NODE_DIR!;!PATH!
        set NODE_CMD=!NODE_DIR!\node.exe
        set NPM_CMD=!NODE_DIR!\npm.cmd
    ) else if exist "C:\Users\srijan\AppData\Local\nodejs\node-v22.17.0-win-x64\node.exe" (
        set NODE_DIR=C:\Users\srijan\AppData\Local\nodejs\node-v22.17.0-win-x64
        set PATH=!NODE_DIR!;!PATH!
        set NODE_CMD=!NODE_DIR!\node.exe
        set NPM_CMD=!NODE_DIR!\npm.cmd
    ) else (
        echo [ERROR] Node.js not found in PATH. Please install Node.js (v18+)
        pause
        exit /b 1
    )
)

echo [OK] Python detected: %PYTHON_CMD%
echo [OK] Node.js detected: %NODE_CMD%
echo.

REM 3. Check & Install Server Dependencies
if not exist "server\node_modules\" (
    echo [Setup] Installing Server dependencies (npm install)...
    cd server && call %NPM_CMD% install && cd ..
)

REM 4. Check & Install Client Dependencies
if not exist "client\node_modules\" (
    echo [Setup] Installing Client dependencies (npm install)...
    cd client && call %NPM_CMD% install && cd ..
)

REM 5. Start Python ML Microservice (Port 5001)
echo.
echo [1/3] Starting Python ML Microservice (Port 5001)...
start "AgriComply ML Service (Port 5001)" cmd /k "cd /d %~dp0ml_service && %PYTHON_CMD% app.py"

echo Waiting 3 seconds for ML engine to start...
timeout /t 3 /nobreak > nul

REM 6. Start Node.js API Server (Port 5000)
echo.
echo [2/3] Starting Node.js Backend API (Port 5000)...
start "AgriComply Node Server (Port 5000)" cmd /k "cd /d %~dp0server && %NODE_CMD% app.js"

echo Waiting 2 seconds for Node server to start...
timeout /t 2 /nobreak > nul

REM 7. Start React Vite Frontend (Port 3000)
echo.
echo [3/3] Starting React Vite Frontend (Port 3000)...
start "AgriComply Client UI (Port 3000)" cmd /k "cd /d %~dp0client && %NPM_CMD% run dev"

echo.
echo ========================================================
echo  All 3 Services Are Running!
echo  -------------------------------------------------------
echo  - Frontend Web UI:  http://localhost:3000
echo  - Backend API:      http://localhost:5000
echo  - Python ML Engine: http://localhost:5001
echo ========================================================
echo.
echo Opening browser to http://localhost:3000...
start http://localhost:3000

echo.
echo (Keep the 3 opened terminal windows running)
echo Press any key to close this launcher.
pause > nul
