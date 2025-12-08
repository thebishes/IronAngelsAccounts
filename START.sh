#!/bin/bash

echo "===================================================="
echo "   Iron & Clean Pro - Starting Application"
echo "===================================================="
echo

echo "[1/4] Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Frontend dependency installation failed"
    exit 1
fi

echo
echo "[2/4] Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Backend dependency installation failed"
    exit 1
fi

echo
echo "[3/4] Testing database connection..."
cd ..
node test-connection.js
if [ $? -ne 0 ]; then
    echo "WARNING: Database connection test failed"
    echo "You may need to check your database configuration"
    echo
fi

echo
echo "[4/4] Starting application..."
echo "Backend will start on: http://localhost:3001"
echo "Frontend will start on: http://localhost:3000"
echo "Login with: tonybisht / Topaz26"
echo
echo "Press Ctrl+C to stop the application"
echo

npm run dev