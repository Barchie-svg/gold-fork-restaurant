@echo off
title The Golden Fork Restaurant Server
color 0A

echo.
echo  =========================================
echo   THE GOLDEN FORK RESTAURANT - SERVER
echo  =========================================
echo.
echo  Using MongoDB Atlas (Cloud Database)
echo.

cd /d "%~dp0"

:: Set Node path
set "PATH=C:\Users\hp\AppData\Local\nvm\v22.14.0;C:\Users\hp\AppData\Roaming\npm;%PATH%"

:: Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    npm install
    echo.
)

echo [INFO] Starting The Golden Fork server...
echo.
node server.js

pause
