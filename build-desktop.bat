@echo off
chcp 65001 >nul
title Supermarket Manager Build

echo ============================================
echo   Supermarket Manager - Desktop Build
echo ============================================
echo.

cd /d "%~dp0desktop"

echo [1/3] Building React frontend...
call npx vite build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)
echo Frontend build complete
echo.

echo [2/3] Packaging desktop app...
call npx electron-builder --win --dir
echo.

echo [3/3] Copying exe to project root...
if exist "dist-electron\win-unpacked\Supermarket Manager.exe" (
    copy "dist-electron\win-unpacked\Supermarket Manager.exe" "%~dp0Supermarket Manager.exe" /Y
    echo.
    echo ============================================
    echo   SUCCESS!
    echo   Exe copied to: %~dp0Supermarket Manager.exe
    echo ============================================
) else (
    echo.
    echo ============================================
    echo   Build finished. Check dist-electron folder
    echo ============================================
)

cd /d %~dp0
pause
