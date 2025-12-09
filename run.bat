@echo off
echo ===============================================
echo   Iron & Clean Pro - Single App Deployment
echo ===============================================
echo.

REM Install dependencies if needed
if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
)

REM Build React app if not exists
if not exist "build\" (
  echo Building React app...
  call npm run build
)

echo.
echo Starting combined app...
echo App will be available at: http://localhost:3001
echo Login: tonybisht / Topaz26
echo.

REM Start the server
node server/server.js
