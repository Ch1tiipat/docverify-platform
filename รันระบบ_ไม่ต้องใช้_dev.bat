@echo off
echo ===================================================
echo   DocVerify Platform - Local Production Server
echo ===================================================
echo.
echo Starting web server on http://localhost:3000...
echo.
echo Opening browser automatically...
start http://localhost:3000
echo.
npx.cmd serve -l 3000 out
pause
