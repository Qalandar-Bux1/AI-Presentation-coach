# Verify bundled assets exist before building backend.exe
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

$whisperDir = Join-Path $root "server\models\whisper"
$ffmpegDir = Join-Path $root "server\bin"

$basePt = Join-Path $whisperDir "base.pt"
$tinyPt = Join-Path $whisperDir "tiny.pt"
$ffmpegExe = Join-Path $ffmpegDir "ffmpeg.exe"
$ffprobeExe = Join-Path $ffmpegDir "ffprobe.exe"

Write-Host "[verify] whisperDir=$whisperDir"
Write-Host "[verify] ffmpegDir=$ffmpegDir"

$hasWhisper = (Test-Path $basePt) -or (Test-Path $tinyPt)
if (-not $hasWhisper) {
  throw "[verify] Missing Whisper weights. Expected base.pt or tiny.pt under $whisperDir"
}
if (-not (Test-Path $ffmpegExe) -or -not (Test-Path $ffprobeExe)) {
  throw "[verify] Missing ffmpeg.exe and/or ffprobe.exe under $ffmpegDir"
}

Write-Host "[verify] OK: Whisper weights + ffmpeg/ffprobe exist."

