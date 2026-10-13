@echo off
echo ======================================================================
echo    ECOTWIN - Smart Waste Management Digital Twin College Project
echo ======================================================================
echo.
echo Starting FastAPI Backend (Port 8000)...
start "ECOTWIN Backend (FastAPI)" cmd /k "cd backend && .\venv\Scripts\python main.py"

timeout /t 3 /nobreak > nul

echo Starting React + Vite Frontend (Port 5173)...
start "ECOTWIN Frontend (Vite React)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo ======================================================================
echo    Project is running!
echo    - Frontend Portal: http://localhost:5173
echo    - Backend API Docs: http://localhost:8000/docs
echo    - Admin Login: admin / admin123
echo    - Student Login: student / user123
echo ======================================================================
start http://localhost:5173
pause
