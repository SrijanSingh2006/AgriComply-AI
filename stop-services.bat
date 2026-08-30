@echo off
title Stop AgriComply Services
echo ========================================================
echo          Stopping AgriComply AI Services...
echo ========================================================
echo.

echo Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>nul

echo Stopping Python ML processes...
taskkill /F /IM python.exe >nul 2>nul

echo.
echo [OK] All AgriComply background services stopped cleanly!
timeout /t 2 /nobreak > nul
exit
