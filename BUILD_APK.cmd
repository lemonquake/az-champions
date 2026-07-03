@echo off
setlocal EnableDelayedExpansion
title AZ CHAMPIONS - APK Builder
cd /d "%~dp0"

echo.
echo   ====================================================
echo       A Z   C H A M P I O N S   A P K   B U I L D E R
echo   ====================================================
echo.

echo   [1/3] Copying game files to Android assets...
xcopy /y /e /i "js" "android\app\src\main\assets\js" >nul
if errorlevel 1 (
  echo   [ERROR] Failed to copy js assets.
  pause
  exit /b 1
)
xcopy /y /e /i "css" "android\app\src\main\assets\css" >nul
if errorlevel 1 (
  echo   [ERROR] Failed to copy css assets.
  pause
  exit /b 1
)
copy /y "index.html" "android\app\src\main\assets\index.html" >nul
if errorlevel 1 (
  echo   [ERROR] Failed to copy index.html.
  pause
  exit /b 1
)

echo   [2/3] Building APK with Gradle...
cd android
call .\gradlew.bat assembleDebug
if errorlevel 1 (
  echo.
  echo   [ERROR] Gradle build failed.
  cd ..
  pause
  exit /b 1
)
cd ..

echo   [3/3] Deploying built APK to root folder...
if not exist "android\app\build\outputs\apk\debug\app-debug.apk" (
  echo   [ERROR] Built APK not found in build directory.
  pause
  exit /b 1
)
copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "az-champions-debug.apk" >nul
if errorlevel 1 (
  echo   [ERROR] Failed to copy built APK to root folder.
  pause
  exit /b 1
)

echo.
echo   ====================================================
echo       BUILD SUCCESSFUL!
echo       APK saved as: az-champions-debug.apk
echo   ====================================================
echo.
pause
