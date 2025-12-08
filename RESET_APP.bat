@echo off
echo ====================================================
echo    RESETTING Iron & Clean Pro App
echo ====================================================
echo.

echo [1/6] Stopping any running servers...
taskkill /F /IM node.exe 2>NUL
npx kill-port 3000 3001 2>NUL

echo.
echo [2/6] Cleaning old files...
if exist node_modules rmdir /s /q node_modules
if exist server\node_modules rmdir /s /q server\node_modules
if exist package-lock.json del package-lock.json
if exist server\package-lock.json del server\package-lock.json

echo.
echo [3/6] Creating fresh backend...
mkdir server 2>NUL
cd server

echo { > package.json
echo   "name": "iron-clean-backend", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "scripts": { >> package.json
echo     "start": "node simple-server.js" >> package.json
echo   }, >> package.json
echo   "dependencies": { >> package.json
echo     "express": "^4.18.2", >> package.json
echo     "cors": "^2.8.5" >> package.json
echo   } >> package.json
echo } >> package.json

echo Installing backend...
call npm install

cd ..

echo.
echo [4/6] Installing frontend...
call npm install

echo.
echo [5/6] Testing setup...
echo Starting test server...
cd server
start /B node simple-server.js
timeout /t 3
cd ..

echo.
echo [6/6] Starting application...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo Login: tonybisht / Topaz26
echo.
call npm start