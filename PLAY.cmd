@echo off
setlocal EnableDelayedExpansion
title AZ CHAMPIONS - Game Launcher
cd /d "%~dp0"

rem ============================================================
rem   AZ CHAMPIONS - Plug 'n' Play Launcher (by Aljay Leodones)
rem   Double-click me. I handle everything:
rem     1. Find a free port
rem     2. Use Python or Node.js if installed (local game server)
rem     3. Open the game in your default browser
rem     4. No Python/Node? The game opens directly - still works!
rem ============================================================

if not exist "index.html" (
  echo.
  echo   [ERROR] index.html not found next to PLAY.cmd.
  echo   Keep this file inside the az-champions game folder.
  echo.
  pause
  exit /b 1
)

echo.
echo   ====================================================
echo       A Z   C H A M P I O N S
echo       by Aljay Leodones  -  Beta Launcher
echo   ====================================================
echo.

rem ---------- find a free port starting at 8321 ----------
set PORT=8321
:findport
netstat -an | findstr /r /c:":%PORT% " | findstr LISTENING >nul 2>&1
if not errorlevel 1 (
  set /a PORT+=1
  if !PORT! LSS 8332 goto findport
)

rem ---------- detect a server runtime ----------
set RUNTIME=
python -c "import sys" >nul 2>&1
if not errorlevel 1 set RUNTIME=python
if not defined RUNTIME (
  py -3 -c "import sys" >nul 2>&1
  if not errorlevel 1 set RUNTIME=py
)
if not defined RUNTIME (
  node -e "0" >nul 2>&1
  if not errorlevel 1 set RUNTIME=node
)

rem ---------- LAN address for playing on your phone ----------
set LANIP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  if not defined LANIP set LANIP=%%a
)
if defined LANIP set LANIP=%LANIP: =%

if not defined RUNTIME goto filemode

echo   Game server starting on port %PORT% ...
echo.
echo     Play on this PC  :  http://localhost:%PORT%
if defined LANIP echo     Play on phone    :  http://%LANIP%:%PORT%   ^(same Wi-Fi^)
echo.
echo   TIP: If Windows Firewall asks, click "Allow" to enable
echo        playing from your phone.
echo.
echo   Keep this window open while playing.
echo   Close this window to stop the game.
echo   ----------------------------------------------------
echo.

rem open the browser a moment after the server is up
start "" /min cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:%PORT%/"

rem no-cache server stops phones from playing a stale cached build;
rem falls back to the plain module server if the script ever goes missing
if "%RUNTIME%"=="python" (
  if exist "server\no-cache-server.py" ( python "server\no-cache-server.py" %PORT% >nul 2>&1 ) else ( python -m http.server %PORT% >nul 2>&1 )
)
if "%RUNTIME%"=="py" (
  if exist "server\no-cache-server.py" ( py -3 "server\no-cache-server.py" %PORT% >nul 2>&1 ) else ( py -3 -m http.server %PORT% >nul 2>&1 )
)
if "%RUNTIME%"=="node"   node "server\static-server.cjs" %PORT%
goto end

:filemode
echo   Python / Node.js not found - opening the game directly.
echo   Everything still works. Progress saves in your browser.
echo.
start "" "%~dp0index.html"
timeout /t 3 /nobreak >nul

:end
endlocal
