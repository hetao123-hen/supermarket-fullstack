# Supermarket Manager - Setup & Build Script (PowerShell)
# Run this script in a directory that has all the project files.

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Supermarket Manager - Setup Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check for Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check for npm
try {
    $npmVersion = npm --version
    Write-Host "npm detected: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm is not installed." -ForegroundColor Red
    exit 1
}

# Check for GCC (MinGW)
try {
    $gccVersion = gcc --version | Select-Object -First 1
    Write-Host "GCC detected: $gccVersion" -ForegroundColor Green
} catch {
    Write-Host "WARNING: GCC not found. Install MinGW or TDM-GCC to build the C backend." -ForegroundColor Yellow
    Write-Host "The desktop app can still run with its built-in data engine." -ForegroundColor Yellow
}

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host ""
Write-Host "Project Structure:" -ForegroundColor Cyan
Write-Host "  backend/    - C CLI backend (supermarket.exe)" -ForegroundColor White
Write-Host "  desktop/    - Electron desktop application" -ForegroundColor White
Write-Host "  scripts/    - Build and utility scripts" -ForegroundColor White
Write-Host ""

# Step 1: Build C backend
Write-Host "[1/3] Building C Backend..." -ForegroundColor Yellow
Set-Location "$projectRoot\backend"

if (Get-Command "gcc" -ErrorAction SilentlyContinue) {
    if (-not (Test-Path "bin")) { New-Item -ItemType Directory -Path "bin" -Force | Out-Null }
    if (-not (Test-Path "obj")) { New-Item -ItemType Directory -Path "obj" -Force | Out-Null }

    $sourceFiles = @("main.c", "goods.c", "file_io.c", "utils.c")
    $compileOk = $true

    foreach ($file in $sourceFiles) {
        $objName = $file -replace "\.c$", ".o"
        Write-Host "  Compiling $file..."
        gcc -Wall -Wextra -I./include -std=c11 -c "src/$file" -o "obj/$objName"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ERROR compiling $file" -ForegroundColor Red
            $compileOk = $false
        }
    }

    if ($compileOk) {
        gcc obj/main.o obj/goods.o obj/file_io.o obj/utils.o -o bin/supermarket.exe
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  C Backend build complete: bin/supermarket.exe" -ForegroundColor Green
        } else {
            Write-Host "  ERROR: Linking failed" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  Skipping C backend build (GCC not found)" -ForegroundColor Yellow
}

# Generate placeholder icons
Write-Host ""
Write-Host "[2/3] Generating assets..." -ForegroundColor Yellow
Set-Location "$projectRoot\desktop"
if (-not (Test-Path "assets")) { New-Item -ItemType Directory -Path "assets" -Force | Out-Null }

$iconPath = "$projectRoot\desktop\assets\icon.png"
if (-not (Test-Path $iconPath)) {
    try {
        python "$projectRoot\scripts\generate-icon.py" 2>$null
        if (Test-Path "icon.png") {
            Move-Item -Path "icon.png" -Destination "assets\icon.png" -Force
        }
        if (Test-Path "icon.ico") {
            Move-Item -Path "icon.ico" -Destination "assets\icon.ico" -Force
        }
        Write-Host "  Icons generated" -ForegroundColor Green
    } catch {
        Write-Host "  WARNING: Could not generate icons (Python not found)" -ForegroundColor Yellow
        Write-Host "  Place icon.png and icon.ico manually in desktop/assets/" -ForegroundColor Yellow
    }
}

# Install dependencies and build
Write-Host ""
Write-Host "[3/3] Installing npm dependencies..." -ForegroundColor Yellow
Set-Location "$projectRoot\desktop"

npm install --loglevel=error
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ERROR: npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Development Commands:" -ForegroundColor White
Write-Host "  cd desktop" -ForegroundColor Gray
Write-Host "  npm run dev       # Start in development mode" -ForegroundColor Gray
Write-Host "  npm run build:win # Build installer" -ForegroundColor Gray
Write-Host ""
Write-Host "Output:" -ForegroundColor White
Write-Host "  desktop/dist-electron/ - Installer location" -ForegroundColor Gray

Set-Location $projectRoot
