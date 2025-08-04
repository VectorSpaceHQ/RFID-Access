REM Run this script to start the development server on Windows

@echo off
echo Starting RFID Access Development Server...
echo ========================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if required packages are installed
echo Checking dependencies...
python -c "import eve, sqlalchemy, bcrypt" 2>nul
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
)

REM Start the server in the background
echo Starting server...
start /B python run.py

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

echo Server started!
echo Server URL: http://localhost:5000

REM Run the seed script
echo.
echo Seeding database with test data...
python dev_seed.py

echo.
echo Development environment is ready!
echo Server is running at http://localhost:5000
echo API endpoints available at http://localhost:5000/api
echo.
echo Press any key to stop the server...
pause >nul

REM Stop the server
taskkill /f /im python.exe >nul 2>&1
echo Server stopped. 