@echo off
title SteadyAim - FPS Mouse Stability Trainer
cd /d "%~dp0"

echo ========================================================
echo   STEADYAIM - FPS Mouse Stability & Anti-Jitter Trainer
echo ========================================================
echo.
echo Starting local development server...
echo Your browser will open automatically at http://localhost:5173
echo Press Ctrl+C in this window when you want to stop the server.
echo.

start "" "http://localhost:5173"
npm run dev -- --host
