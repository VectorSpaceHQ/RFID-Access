#!/bin/bash
# Development Startup Script for RFID Access System on Linux/Bash
# Only use on development machine. Running it on production machine will put seed data into production database.

# Check if running on Raspberry Pi and exit if so
if [ -f /proc/cpuinfo ] && grep -q "Raspberry Pi" /proc/cpuinfo; then
    echo "Error: This script is for development machines only."
    echo "Detected Raspberry Pi - exiting for safety."
    echo "Do not run development scripts in production environment to protect production data."
    exit 1
fi

# Alternative check for Raspberry Pi using system info
if command -v cat &> /dev/null && [ -f /sys/firmware/devicetree/base/model ] && grep -q "Raspberry Pi" /sys/firmware/devicetree/base/model 2>/dev/null; then
    echo "Error: This script is for development machines only."
    echo "Detected Raspberry Pi - exiting for safety."
    echo "Do not run development scripts in production environment to protect production data."
    exit 1
fi

echo "Starting RFID Access Development Environment..."
echo "============================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is not installed or not in PATH"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: node is not installed or not in PATH"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed or not in PATH"
    exit 1
fi

# Check if required Python packages are installed
echo "Checking Python dependencies..."
python3 -c "import eve, sqlalchemy, bcrypt, flask_cors, requests" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing Python dependencies..."
    pip3 install -r requirements.txt
fi

# Check if Angular CLI is available
echo "Checking Angular CLI..."
if ! command -v ng &> /dev/null; then
    echo "Installing Angular CLI..."
    npm install -g @angular/cli
fi

# Install client dependencies if needed
echo "Checking client dependencies..."
cd ../client
if [ ! -d "node_modules" ]; then
    echo "Installing client dependencies..."
    npm install
fi

# Start Angular dev server in the background
echo "Starting Angular development server..."
npm start &
ANGULAR_PID=$!

# Wait for Angular to start
echo "Waiting for Angular dev server to start..."
sleep 10

# Check if Angular started successfully
if ! kill -0 $ANGULAR_PID 2>/dev/null; then
    echo "Error: Angular dev server failed to start"
    exit 1
fi

echo "Angular dev server started with PID: $ANGULAR_PID"
echo "Angular URL: http://localhost:4200"

# Go back to server directory
cd ../server

# Start the Flask server in the background
echo "Starting Flask server..."
python3 run.py debug &
FLASK_PID=$!

# Wait a moment for server to start
sleep 5

# Check if Flask server started successfully
if ! kill -0 $FLASK_PID 2>/dev/null; then
    echo "Error: Flask server failed to start"
    kill $ANGULAR_PID 2>/dev/null
    exit 1
fi

echo "Flask server started with PID: $FLASK_PID"
echo "Flask URL: http://localhost:8443"

# Run the seed script
echo ""
echo "Seeding database with test data..."
python3 dev_seed.py

echo ""
echo "Development environment is ready!"
echo "================================="
echo "Frontend (Angular): http://localhost:4200"
echo "Backend (Flask): http://localhost:8443"
echo "Main Application: http://localhost:8443 (serves Angular + API)"
echo ""
echo "Hot reload is enabled for both frontend and backend!"
echo ""
echo "To stop all servers, press Ctrl+C"
echo "Or run: kill $ANGULAR_PID $FLASK_PID"

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $ANGULAR_PID $FLASK_PID 2>/dev/null; exit" INT
wait 