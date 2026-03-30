"""
STEP 3 — Backend packaging (PyInstaller).

Run from `server/`:
  python build.py

Outputs:
  server/dist/backend.exe
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> int:
    server_dir = Path(__file__).resolve().parent
    spec_path = server_dir / "pyinstaller_backend.spec"

    whisper_dir = server_dir / "models" / "whisper"
    ffmpeg_dir = server_dir / "bin"

    expected_whisper_size = (server_dir / ".env").read_text(encoding="utf-8", errors="ignore")
    # Best-effort parse; if missing, we'll just check base.pt existence.
    expected_pt = None
    for line in expected_whisper_size.splitlines():
        if line.startswith("WHISPER_MODEL_SIZE="):
            expected_pt = line.split("=", 1)[1].strip().lower() + ".pt"
            break

    if expected_pt:
        whisper_model_file = whisper_dir / expected_pt
    else:
        whisper_model_file = whisper_dir / "base.pt"

    ffmpeg_exe = ffmpeg_dir / "ffmpeg.exe"
    ffprobe_exe = ffmpeg_dir / "ffprobe.exe"

    if not whisper_model_file.is_file():
        print(f"[build] ERROR: Missing Whisper weights: {whisper_model_file}", file=sys.stderr)
        print(f"[build] Download them with: scripts\\download_bundled_assets.py --whisper-only --whisper {whisper_model_file.stem}", file=sys.stderr)
        return 3
    if not ffmpeg_exe.is_file() or not ffprobe_exe.is_file():
        print(f"[build] ERROR: Missing ffmpeg/ffprobe under: {ffmpeg_dir}", file=sys.stderr)
        return 4

    if not spec_path.is_file():
        print(f"[build] ERROR: Missing spec file: {spec_path}", file=sys.stderr)
        return 1

    # Ensure pyinstaller exists
    try:
        import PyInstaller  # noqa: F401
    except Exception:
        print("[build] Installing pyinstaller (missing).", file=sys.stderr)
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])

    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--noconfirm",
        "--clean",
        str(spec_path),
    ]

    print("[build] Running:", " ".join(cmd))
    proc = subprocess.run(cmd, cwd=str(server_dir))
    if proc.returncode != 0:
        print(f"[build] ERROR: PyInstaller failed (code={proc.returncode})", file=sys.stderr)
        return proc.returncode

    exe = server_dir / "dist" / "backend.exe"
    if not exe.is_file():
        print(f"[build] ERROR: backend.exe not found at {exe}", file=sys.stderr)
        return 2

    print(f"[build] OK: {exe}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

