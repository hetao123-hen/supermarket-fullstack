# Supermarket Manager - One-Click Desktop Build Script
# Run this script to build the desktop app exe

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Supermarket Manager - Desktop Build" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Generate proper icon.ico from icon.png
Write-Host "[1/3] Preparing icon..." -ForegroundColor Yellow
$pngPath = Join-Path $PSScriptRoot "desktop\assets\icon.png"
$icoPath = Join-Path $PSScriptRoot "desktop\assets\icon.ico"

if (Test-Path $pngPath) {
    Add-Type -AssemblyName System.Drawing
    $img = [System.Drawing.Image]::FromFile($pngPath)
    $stream = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
    $bmp = New-Object System.Drawing.Bitmap($img)
    $bmp.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
    $stream.Close()
    $bmp.Dispose()
    $img.Dispose()
    Write-Host "  icon.ico generated" -ForegroundColor Green
} else {
    Write-Host "  WARNING: icon.png not found at $pngPath" -ForegroundColor Yellow
}

# Step 2: Build Vite renderer
Write-Host "[2/3] Building React frontend..." -ForegroundColor Yellow
Set-Location (Join-Path $PSScriptRoot "desktop")
npx vite build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  Frontend build complete" -ForegroundColor Green

# Step 3: Package with electron-builder (directory mode - no admin needed)
Write-Host "[3/3] Packaging desktop app..." -ForegroundColor Yellow
npx electron-builder --win --dir
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Directory build failed, trying without icon..."
    npx electron-builder --win --dir --config.win.icon=null
}
Write-Host ""

# Find the output exe
$exePath = Join-Path $PSScriptRoot "desktop\dist-electron\win-unpacked\Supermarket Manager.exe"
if (Test-Path $exePath) {
    # Copy to project root
    $dest = Join-Path $PSScriptRoot "Supermarket Manager.exe"
    Copy-Item $exePath $dest -Force
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Exe copied to root:" -ForegroundColor Green
    Write-Host "  $dest" -ForegroundColor White
    Write-Host "============================================" -ForegroundColor Green
} else {
    Write-Host "============================================" -ForegroundColor Yellow
    Write-Host "  Build finished. Check desktop\dist-electron\" -ForegroundColor Yellow
    Write-Host "============================================" -ForegroundColor Yellow
}

Set-Location $PSScriptRoot
pause
