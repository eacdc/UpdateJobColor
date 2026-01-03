@echo off
echo ========================================
echo Update Job Card System - Local Server
echo ========================================
echo.
echo Starting local web server on port 8000...
echo.
echo Make sure the backend is running on http://localhost:3001
echo (Main backend in CDC Site\backend folder)
echo.
echo Open your browser and go to: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d "%~dp0"
python -m http.server 8000
