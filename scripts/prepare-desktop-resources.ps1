# prepare-desktop-resources.ps1
# Run from repo root:  powershell -ExecutionPolicy Bypass -File scripts\prepare-desktop-resources.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$serverDist = Join-Path $root "server\dist\backend.exe"
$destExe = Join-Path $root "electron\resources\backend.exe"

$clientStandalone = Join-Path $root "client\.next\standalone"
$clientPublic = Join-Path $root "client\public"
$clientStatic = Join-Path $root "client\.next\static"

$destFrontendRoot = Join-Path $root "electron\resources\frontend"
$destStandalone = Join-Path $destFrontendRoot "standalone"

if (-not (Test-Path $serverDist)) {
  Write-Host "ERROR: Missing $serverDist — build backend first: server\scripts\build_backend.cmd"
  exit 1
}

if (-not (Test-Path $clientStandalone)) {
  Write-Host "ERROR: Missing $clientStandalone — build frontend for desktop: cd client && npm run build:desktop"
  exit 1
}

New-Item -ItemType Directory -Force -Path (Split-Path $destExe) | Out-Null
New-Item -ItemType Directory -Force -Path $destFrontendRoot | Out-Null

if (Test-Path $destStandalone) {
  Remove-Item -Recurse -Force $destStandalone
}

Copy-Item -Force $serverDist $destExe

# Copy Next standalone server
New-Item -ItemType Directory -Force -Path $destStandalone | Out-Null
Copy-Item -Recurse -Force $clientStandalone/* $destStandalone/

# Copy public assets (optional but safe)
if (Test-Path $clientPublic) {
  $destPublic = Join-Path $destFrontendRoot "public"
  if (Test-Path $destPublic) { Remove-Item -Recurse -Force $destPublic }
  Copy-Item -Recurse -Force $clientPublic $destPublic
}

# Copy static assets (optional if not already included in standalone; kept safe)
if (Test-Path $clientStatic) {
  $destStatic = Join-Path $destStandalone ".next\static"
  New-Item -ItemType Directory -Force -Path (Split-Path $destStatic) | Out-Null
  Copy-Item -Recurse -Force $clientStatic $destStandalone\.next\static
}

Write-Host "OK: Copied backend.exe + Next standalone -> electron\resources\frontend\"
Write-Host "Next: cd electron && npm install && npm run dist"
