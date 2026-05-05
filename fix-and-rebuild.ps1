# Fix Script - Replace updated files in existing win-unpacked app
# Run this after: cd desktop && npx vite build

$root = "C:\Users\31475\Desktop\now super from github"
$unpacked = "$root\desktop\dist-electron\win-unpacked"
$dist = "$root\desktop\dist"
$srcMain = "$root\desktop\src\main"

Write-Host "Updating app files with bug fix..." -ForegroundColor Yellow

# 1. Replace renderer (compiled frontend)
if (Test-Path "$unpacked\resources\app\dist") {
    Remove-Item "$unpacked\resources\app\dist" -Recurse -Force
}
Copy-Item "$dist" "$unpacked\resources\app\dist" -Recurse -Force
Write-Host "  [OK] Frontend updated (dist)" -ForegroundColor Green

# 2. Replace main process files (database.js fix)
Copy-Item "$srcMain\database.js" "$unpacked\resources\app\src\main\database.js" -Force
Copy-Item "$srcMain\main.js" "$unpacked\resources\app\src\main\main.js" -Force
Copy-Item "$srcMain\preload.js" "$unpacked\resources\app\src\main\preload.js" -Force
Copy-Item "$srcMain\menu.js" "$unpacked\resources\app\src\main\menu.js" -Force
Write-Host "  [OK] Main process updated (database.js fix)" -ForegroundColor Green

# 3. Copy to root
Copy-Item "$unpacked\Supermarket Manager.exe" "$root\Supermarket Manager.exe" -Force
Write-Host "  [OK] Copied to root: $root\Supermarket Manager.exe" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  FIX APPLIED!" -ForegroundColor Green
Write-Host "  Run: $root\Supermarket Manager.exe" -ForegroundColor White
Write-Host "  Then try adding a goods item" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Green
pause
