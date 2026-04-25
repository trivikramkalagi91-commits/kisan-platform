@echo off
echo ==========================================
echo   Starting Kisan Platform Super App
echo ==========================================

start cmd /k "echo 🐍 Starting Crop Health AI API... && cd crop_health_api && python start.py"
start cmd /k "echo 🟢 Starting Node Backend... && cd backend && npm run dev"
start cmd /k "echo ⚛️ Starting React Frontend... && cd frontend && npm start"

echo.
echo All services are starting in separate windows.
echo - AI API: http://localhost:5001
echo - Main API: http://localhost:5000
echo - Frontend: http://localhost:3000
echo.
pause
