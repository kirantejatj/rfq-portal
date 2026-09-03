@echo off
title Stop AGIC RFQ Portal
echo ========================================================
echo   Stopping AGIC RFQ Portal Background Services
echo ========================================================

echo Stopping Python backend (uvicorn)...
taskkill /F /FI "WINDOWTITLE eq RFQ Backend Service*" 2>nul
taskkill /F /IM uvicorn.exe /T 2>nul

echo Stopping Node.js frontend (vite)...
taskkill /F /FI "WINDOWTITLE eq RFQ Frontend Service*" 2>nul

echo.
echo Servers stopped successfully.
timeout /t 3
