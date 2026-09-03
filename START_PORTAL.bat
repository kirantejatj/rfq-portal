@echo off
title AGIC RFQ Portal Launcher
echo ========================================================
echo   Starting AGIC RFQ Portal (Backend + Frontend)
echo ========================================================

set "PROJECT_DIR=C:\Users\Appadmin\.gemini\antigravity\scratch\rfq-portal"
set "PATH=C:\Users\Appadmin\AppData\Local\Programs\Git\cmd;C:\Users\Appadmin\.local\bin;%PATH%"

echo 1. Starting Backend Server (FastAPI on http://127.0.0.1:8000)...
start "RFQ Backend Service" /min cmd /c "cd /d %PROJECT_DIR%\backend && uv run python run.py"

echo 2. Waiting for backend startup...
timeout /t 2 /nobreak >nul

echo 3. Starting Frontend Web Portal (http://localhost:5173)...
start "RFQ Frontend Service" /min cmd /c "cd /d %PROJECT_DIR%\frontend && npm run dev -- --host"

echo 4. Waiting for frontend startup...
timeout /t 2 /nobreak >nul

echo 5. Opening Portal in your default web browser...
start http://localhost:5173

echo ========================================================
echo   SUCCESS: AGIC RFQ Portal is running independently!
echo   
echo   - Web Portal:    http://localhost:5173
echo   - API Swagger:   http://127.0.0.1:8000/docs
echo   - CE Login:      9876543210 / Admin@123
echo ========================================================
timeout /t 4
