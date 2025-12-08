@echo off
echo ====================================================
echo    Iron & Clean Pro - Starting Application
echo ====================================================
echo.

echo [1/4] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend dependency installation failed
    pause
    exit /b 1
)

echo.
echo [2/4] Installing backend dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend dependency installation failed
    pause
    exit /b 1
)

echo.
echo [3/4] Testing database connection...
cd ..
node test-connection.js
if %errorlevel% neq 0 (
    echo WARNING: Database connection test failed
    echo You may need to check your database configuration
    echo.
)

echo.
echo [4/4] Starting application...
echo Backend will start on: http://localhost:3001
echo Frontend will start on: http://localhost:3000
echo Login with: tonybisht / Topaz26
echo.
echo Press Ctrl+C to stop the application
echo.

call npm run dev