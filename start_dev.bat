@echo off
echo ==========================================
echo   Starting AI Arduino IDE
echo ==========================================

cd /d "%~dp0"

echo [1/3] Checking Backend Dependencies...
cd backend
if not exist ".installed" (
    echo Installing backend requirements...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Failed to install backend dependencies.
        pause
        exit /b %errorlevel%
    )
    echo. > .installed
) else (
    echo Backend dependencies already installed. (Delete backend/.installed to reinstall)
)
cd ..

echo [2/3] Checking Frontend Dependencies...
cd frontend
if not exist "node_modules" (
    echo Node modules not found. Installing dependencies...
    call npm install
)
cd ..

echo [3/3] Launching Services...
echo.
echo Launching Backend (Port 8001)...
start "AI Arduino Backend" cmd /k "cd backend && python -m uvicorn main:app --port 8001 --reload"

echo Launching Frontend (Electron)...
start "AI Arduino Frontend" cmd /k "cd frontend && npm run electron:dev"

echo.
echo Success! Electron app is starting...
echo.
pause
