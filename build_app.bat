@echo off
echo ==========================================
echo   Building AI Arduino IDE for Distribution
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/4] Installing Backend Build Tools (PyInstaller)...
cd backend
pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install backend dependencies.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/4] Installing Frontend Dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo Failed to install frontend dependencies.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo [3/4] Building Application...
echo This process will:
echo  1. Compile Python backend to a single executable (dist/backend.exe)
echo  2. Build React Frontend
echo  3. Package Electron App
echo.
echo This may take a few minutes...
echo.

cd frontend
call npm run package:win
if errorlevel 1 (
    echo Build Failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================
echo   BUILD SUCCESSFUL!
echo ==========================================
echo.
echo Installer can be found in:
echo   frontend\dist_app\
echo.
pause
