REM Run this script to start the development environment on Windows

@echo off
echo Starting RFID Access Development Environment...
echo =============================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: node is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if required Python packages are installed
echo Checking Python dependencies...
python -c "import eve, sqlalchemy, bcrypt, flask_cors, requests" 2>nul
if errorlevel 1 (
    echo Installing Python dependencies...
    pip install -r requirements.txt
)

REM Check if Angular CLI is available
echo Checking Angular CLI...
ng version >nul 2>&1
if errorlevel 1 (
    echo Installing Angular CLI...
    npm install -g @angular/cli
)

REM Install client dependencies if needed
echo Checking client dependencies...
cd ..\client
if not exist "node_modules" (
    echo Installing client dependencies...
    npm install
)

REM Start Angular dev server in the background
echo Starting Angular development server...
start /B ng serve --port 4200 --host 0.0.0.0

REM Wait for Angular to start
echo Waiting for Angular dev server to start...
timeout /t 10 /nobreak >nul

echo Angular dev server started!
echo Angular URL: http://localhost:4200

REM Go back to server directory
cd ..\server

REM Start the Flask server in the background
echo Starting Flask server...
start /B python run.py debug

REM Wait a moment for server to start
timeout /t 5 /nobreak >nul

echo Flask server started!
echo Flask URL: http://localhost:8443

REM Run the seed script
echo.
echo Seeding database with test data...
python dev_seed.py

echo.
echo Development environment is ready!
echo =================================
echo Frontend (Angular): http://localhost:4200
echo Backend (Flask): http://localhost:8443
echo Main Application: http://localhost:8443 (serves Angular + API)
echo.
echo Hot reload is enabled for both frontend and backend!
echo.
echo Press any key to stop all servers...
pause >nul

REM Stop the servers
taskkill /f /im ng.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
echo Servers stopped. 