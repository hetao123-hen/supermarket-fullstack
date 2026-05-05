@echo off
chcp 65001 >nul
title Supermarket Manager - Build Script
echo ============================================
echo  Supermarket Manager - Full Build
echo ============================================
echo.

REM --- Step 1: Build C Backend ---
echo [1/3] Building C Backend...
cd /d "%~dp0..\backend"
if not exist "bin" mkdir bin
if not exist "obj" mkdir obj
gcc -Wall -Wextra -I./include -std=c11 -c src/main.c -o obj/main.o
if %errorlevel% neq 0 (
    echo ERROR: Failed to compile main.c
    exit /b 1
)
gcc -Wall -Wextra -I./include -std=c11 -c src/goods.c -o obj/goods.o
if %errorlevel% neq 0 (
    echo ERROR: Failed to compile goods.c
    exit /b 1
)
gcc -Wall -Wextra -I./include -std=c11 -c src/file_io.c -o obj/file_io.o
if %errorlevel% neq 0 (
    echo ERROR: Failed to compile file_io.c
    exit /b 1
)
gcc -Wall -Wextra -I./include -std=c11 -c src/utils.c -o obj/utils.o
if %errorlevel% neq 0 (
    echo ERROR: Failed to compile utils.c
    exit /b 1
)
gcc obj/main.o obj/goods.o obj/file_io.o obj/utils.o -o bin/supermarket.exe
if %errorlevel% neq 0 (
    echo ERROR: Failed to link backend
    exit /b 1
)
echo C Backend build complete: bin/supermarket.exe
echo.

REM --- Step 2: Install Desktop Dependencies ---
echo [2/3] Installing desktop dependencies...
cd /d "%~dp0..\desktop"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    exit /b 1
)
echo.

REM --- Step 3: Build Desktop App ---
echo [3/3] Building desktop application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Desktop build failed
    exit /b 1
)
echo.

echo ============================================
echo  Build Complete!
echo.
echo  C Backend: backend\bin\supermarket.exe
echo  Desktop Installer: desktop\dist-electron\Supermarket Manager-Setup-*.exe
echo ============================================
pause
