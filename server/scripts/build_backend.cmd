@echo off
cd /d "%~dp0.."
echo [build_backend.cmd] cwd=%CD%
REM Build backend.exe with PyInstaller (recommended entrypoint: build.py)
python build.py
if errorlevel 1 (
  echo [build_backend.cmd] ERROR: build.py failed.
  exit /b 1
)
echo [build_backend.cmd] OK: dist\backend.exe
dir dist\backend.exe
