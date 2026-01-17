@echo off
title CloudX Club - Starting Services
color 0A

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║     CloudX Club Management Platform                           ║
echo ║                                                               ║
echo ║   Starting all services...                                    ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

:: Set the root directory
set ROOT_DIR=%~dp0
set BACKEND_DIR=%ROOT_DIR%back_end
set FRONTEND_DIR=%ROOT_DIR%front_end

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js found: 
node --version

:: Kill any existing processes on ports 5000 and 5173
echo.
echo [INFO] Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)

:: Check and install backend dependencies
echo.
echo [INFO] Checking backend dependencies...
cd /d "%BACKEND_DIR%"
if not exist "node_modules" (
    echo [INFO] Installing backend dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install backend dependencies!
        pause
        exit /b 1
    )
)

:: Check and install frontend dependencies
echo.
echo [INFO] Checking frontend dependencies...
cd /d "%FRONTEND_DIR%"
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install frontend dependencies!
        pause
        exit /b 1
    )
)

:: Check if recharts is installed (required for dashboards)
echo [INFO] Checking for recharts...
if not exist "node_modules\recharts" (
    echo [INFO] Installing recharts...
    call npm install recharts
)

:: Start Backend Server
echo.
echo [INFO] Starting Backend Server...
cd /d "%BACKEND_DIR%"
start "CloudX Backend - Port 5000" cmd /k "title CloudX Backend API (Port 5000) && color 0B && npm run dev"

:: Wait for backend to start
echo [INFO] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

:: Start Frontend Server
echo.
echo [INFO] Starting Frontend Server...
cd /d "%FRONTEND_DIR%"
start "CloudX Frontend - Port 5173" cmd /k "title CloudX Frontend (Port 5173) && color 0E && npm run dev"

:: Wait for frontend to start
echo [INFO] Waiting for frontend to initialize...
timeout /t 5 /nobreak >nul

:: Open browser
echo.
echo [INFO] Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173

:: Display success message
echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                                                               ║
echo ║    CloudX Club is now running!                                ║
echo ║                                                               ║
echo ║   Frontend: http://localhost:5173                             ║
echo ║   Backend:  http://localhost:5000/api/v1                      ║
echo ║                                                               ║
echo ║   Test Accounts:                                              ║
echo ║   - Admin:   admin@college.edu / password123                  ║
echo ║   - Teacher: teacher@college.edu / password123                ║
echo ║   - Student: student@college.edu / password123                ║
echo ║                                                               ║
echo ║   Close the terminal windows to stop the servers.             ║
echo ║                                                               ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo Press any key to close this window (servers will keep running)...
pause >nul
