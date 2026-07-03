@echo off
title AZ Champions - Payment Verification Server
cd /d "%~dp0"

set PAYPAL_CLIENT_ID=ARtXnF--SZ8RrvIy8LxqrORd2zQzKD45jnXz02gZck4Bsf17cVFdMJ7wx1XUn56ZXhWbpPA6KBoHXODL
set PAYPAL_SECRET=EFGph4mdUaL6ROjZBbIBXiPbzqcC0D_Lzro_ED6dd_Ezg1_iWS9MDoOdhoy-nXaluZ8VZF8LJGFXulH7
set PORT=8787

echo =======================================================
echo   AZ Champions - Payment Verification Server
echo   Status: Booting...
echo   Port: %PORT%
echo =======================================================
echo.

node paypal-verify-example.cjs
if %errorlevel% neq 0 (
  echo.
  echo [ERROR] Failed to run the verification server.
  echo Make sure you have Node.js installed and run 'npm install express' in the server directory.
  echo.
)
pause
