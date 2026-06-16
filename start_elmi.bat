@echo off
title ESWATINI LMIS SYSTEM

echo =====================================
echo   STARTING ESWATINI LMIS SYSTEM
echo =====================================
echo.

REM =====================================
REM START BACKEND
REM =====================================

echo Starting Backend Server...

start cmd /k "cd /d C:\Users\Sukati\my-app\eswatini_lmis_backend && npm start"

timeout /t 5 > nul

REM =====================================
REM START FRONTEND
REM =====================================

echo Starting Frontend React App...

start cmd /k "cd /d C:\Users\Sukati\my-app\eswatini_lmis_frontend && npm start"

echo.
echo =====================================
echo   LMIS SYSTEM STARTED
echo =====================================
echo.

pause
