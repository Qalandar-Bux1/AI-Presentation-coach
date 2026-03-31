# STEP 6 — Build full desktop app (backend.exe + Next standalone + Electron installer)
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File scripts\build-desktop.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "[build-desktop] Installing server deps (pip)..." -ForegroundColor Cyan
Set-Location (Join-Path $root "server")
if (-not (Test-Path ".venv")) {
  # Avoid creating venv by default (keep your current environment).
}
python -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) { throw "pip install failed (exit $LASTEXITCODE)" }

Write-Host "[build-desktop] Packaging backend.exe (PyInstaller)..." -ForegroundColor Cyan
python build.py
if ($LASTEXITCODE -ne 0) { throw "server/build.py failed (exit $LASTEXITCODE)" }

if (-not (Test-Path (Join-Path $root "server\dist\backend.exe"))) {
  throw "backend.exe not found after build."
}

Write-Host "[build-desktop] Installing client deps (npm)..." -ForegroundColor Cyan
Set-Location (Join-Path $root "client")
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed in client/ (exit $LASTEXITCODE)" }

Write-Host "[build-desktop] Building Next.js for desktop (standalone)..." -ForegroundColor Cyan
npm run build:desktop
if ($LASTEXITCODE -ne 0) { throw "Next.js build failed (exit $LASTEXITCODE)" }

Write-Host "[build-desktop] Preparing electron resources..." -ForegroundColor Cyan
Set-Location $root
powershell -ExecutionPolicy Bypass -File scripts\prepare-desktop-resources.ps1
if ($LASTEXITCODE -ne 0) { throw "prepare-desktop-resources.ps1 failed (exit $LASTEXITCODE)" }

Write-Host "[build-desktop] Packaging Electron (NSIS installer + portable)..." -ForegroundColor Cyan
Set-Location (Join-Path $root "electron")
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed in electron/ (exit $LASTEXITCODE)" }

# Ensure Electron binary is fully extracted (avoids electron-builder multipart ZIP download failures)
node .\node_modules\electron\install.js
if ($LASTEXITCODE -ne 0) { throw "electron install.js failed (exit $LASTEXITCODE)" }

npm run dist
if ($LASTEXITCODE -ne 0) { throw "electron-builder failed (exit $LASTEXITCODE)" }

Write-Host "[build-desktop] Done. Artifacts: electron\dist\" -ForegroundColor Green

