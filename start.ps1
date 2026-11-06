# ============================================================
# The Golden Fork Restaurant — Start Script
# This script starts MongoDB (portable) then the Node server
# ============================================================

$nodePath  = "C:\Users\hp\AppData\Local\nvm\v22.14.0"
$npmPath   = "C:\Users\hp\AppData\Roaming\npm"
$env:PATH  = "$nodePath;$npmPath;" + $env:PATH

$mongoExe  = "C:\Users\hp\mongodb\bin\mongod.exe"
$mongoData = "C:\Users\hp\mongodb\data"
$projectDir = "C:\Users\hp\Desktop\restaurant"

# Create data directory if it doesn't exist
if (!(Test-Path $mongoData)) {
    New-Item -ItemType Directory -Path $mongoData -Force | Out-Null
    Write-Host "✅  Created MongoDB data directory: $mongoData"
}

# Check if MongoDB is already running
$mongoRunning = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoRunning) {
    Write-Host "✅  MongoDB is already running (PID: $($mongoRunning.Id))"
} elseif (Test-Path $mongoExe) {
    Write-Host "🚀  Starting MongoDB..."
    Start-Process -FilePath $mongoExe -ArgumentList "--dbpath `"$mongoData`" --port 27017" -WindowStyle Minimized
    Start-Sleep -Seconds 3
    Write-Host "✅  MongoDB started on port 27017"
} else {
    Write-Host "⚠️  MongoDB not found at $mongoExe"
    Write-Host "    Please install MongoDB or update the path in this script."
    Write-Host "    Alternatively, set MONGODB_URI in .env to a MongoDB Atlas connection string."
    exit 1
}

# Seed database if needed (uncomment to run seeder)
# Write-Host "🌱  Seeding database..."
# Set-Location $projectDir
# node seed.js

# Start the Node.js server
Write-Host ""
Write-Host "🍴  Starting The Golden Fork server..."
Write-Host "    Website:   http://localhost:5000"
Write-Host "    Admin:     http://localhost:5000/admin/login.html"
Write-Host ""

Set-Location $projectDir
node server.js
