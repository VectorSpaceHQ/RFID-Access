#!/bin/bash
# Development Startup Script for RFID Access System on Linux/Bash

echo "Starting RFID Access Development Server..."
echo "========================================"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is not installed or not in PATH"
    exit 1
fi

# Check if required packages are installed
echo "Checking dependencies..."
python3 -c "import eve, sqlalchemy, bcrypt" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing dependencies..."
    pip3 install -r requirements.txt
fi

# Start the server in the background
echo "Starting server..."
python3 run.py &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server started successfully
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "Error: Server failed to start"
    exit 1
fi

echo "Server started with PID: $SERVER_PID"
echo "Server URL: http://localhost:5000"

# Run the seed script
echo ""
echo "Seeding database with test data..."
python3 dev_seed.py

echo ""
echo "Development environment is ready!"
echo "Server is running at http://localhost:5000"
echo "API endpoints available at http://localhost:5000/api"
echo ""
echo "To stop the server, run: kill $SERVER_PID"
echo "Or press Ctrl+C to stop this script"

# Wait for user to stop
trap "echo 'Stopping server...'; kill $SERVER_PID; exit" INT
wait 