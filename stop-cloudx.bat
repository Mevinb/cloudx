@echo off
title CloudX Club - Stopping Services
color 0C

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║        CloudX Club Management Platform                        ║
echo ║                                                               ║
echo ║        Stopping all services...                               ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

:: Kill processes on port 5000 (backend)
echo [INFO] Stopping backend server (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
    echo        Killed process %%a
)

:: Kill processes on port 5173 (frontend)
echo [INFO] Stopping frontend server (port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
    echo        Killed process %%a
)

:: Kill processes on port 5174 (frontend alternate)
echo [INFO] Stopping frontend server (port 5174)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5174 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
    echo        Killed process %%a
)

:: Kill any node processes related to cloudx
echo [INFO] Cleaning up node processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq CloudX*" >nul 2>nul

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║      All CloudX services stopped!                             ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Press any key to close...
pause >nul
