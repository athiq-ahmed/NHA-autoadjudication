@echo off
echo ====================================
echo NHA Claims Auto-Adjudication System
echo Starting Full Stack Application
echo ====================================
echo.

if not exist "%~dp0backend\venv311\Scripts\python.exe" (
    echo ERROR: backend\venv311 is missing
    echo Create it first or ask Codex to rebuild the backend environment.
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo Python version:
"%~dp0backend\venv311\Scripts\python.exe" --version
echo.
echo Node.js version:
node --version
echo.

echo Starting Backend API server (FastAPI on port 8000)...
start cmd /k "cd /d %~dp0backend && venv311\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak

echo Starting Frontend development server (Next.js on port 3000)...
start cmd /k "cd /d %~dp0frontend && npm install && npm run dev"
timeout /t 2 /nobreak

echo.
echo ====================================
echo Application Started Successfully
echo ====================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo.
start http://localhost:3000
