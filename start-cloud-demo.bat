@echo off
echo ====================================================
echo 🚀 Starting AgriComply-AI Cloud-Connected Environment...
echo ====================================================

REM Navigate to project root
cd /d "%~dp0"

echo.
echo [1/4] Starting Python ML Service (Port 5001)...
start "AgriComply ML Service" cmd /k "cd ml_service && pip install -r requirements.txt && python app.py"

echo.
echo [2/4] Starting Node.js Backend Server (Port 5000)...
start "AgriComply Node Server" cmd /k "cd server && npm install && node app.js"

echo.
echo [3/4] Starting Cloud Tunnels (Connecting to Vercel)...
start "Localtunnel - Node API" cmd /k "npx localtunnel --port 5000 --subdomain agricomply-node-api-2026"
start "Localtunnel - ML API" cmd /k "npx localtunnel --port 5001 --subdomain agricomply-ml-api-2026"

echo.
echo ====================================================
echo ✅ BACKEND CONNECTED TO CLOUD! 
echo 🌐 The live application is available at: https://client-eta-dun.vercel.app/
echo ====================================================
echo 💡 INTERVIEW TIP: Keep this window open during your interview. 
echo The website (client-eta-dun.vercel.app) is talking directly to the servers running in these windows!
echo ====================================================
pause
