@echo off
echo ====================================================
echo 🚀 Starting AgriComply-AI Enterprise Environment...
echo ====================================================

REM Navigate to project root
cd /d "%~dp0"

echo.
echo [1/3] Starting Python ML Service (Port 5001)...
start "AgriComply ML Service" cmd /k "cd ml_service && pip install -r requirements.txt && python app.py"

echo.
echo [2/3] Starting Node.js Backend Server (Port 5000)...
start "AgriComply Node Server" cmd /k "cd server && npm install && node app.js"

echo.
echo [3/3] Starting React Client (Port 5173)...
start "AgriComply React Client" cmd /k "cd client && npm install && npm run dev"

echo.
echo ✅ All services are starting up! 
echo 🌐 The application will be available at: http://localhost:5173
echo.
echo ====================================================
echo 💡 INTERVIEW TIP: Keep this window open. To stop the servers, just close the 3 new command prompt windows that opened.
echo ====================================================
pause
