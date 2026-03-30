#!/usr/bin/env python3
"""
STEP 1 — Download bundled assets for dev + PyInstaller packaging.

Places files under the Flask server root (next to app.py):
  server\\models\\whisper\\base.pt  (or tiny.pt)
  server\\bin\\ffmpeg.exe + ffprobe.exe  (Windows x64, one ZIP)

Rough sizes (varies by release):
  tiny.pt ~75 MB, base.pt ~145 MB
  FFmpeg ZIP (BtbN win64) often ~100–130 MB uncompressed tools

Usage:
  cd server

  # Whisper only (fastest if you already have ffmpeg on PATH)
  python scripts\\download_bundled_assets.py --whisper-only --whisper base

  # FFmpeg only
  python scripts\\download_bundled_assets.py --ffmpeg-only

  # Both (longest — two big downloads)
  python scripts\\download_bundled_assets.py --whisper base
"""

from __future__ import annotations

import argparse
import os
import shutil
import sys
import tempfile
import time
import urllib.error
import urllib.request
import zipfile
from pathlib import Path

# Whisper official weights (openai-whisper 20231117-compatible URLs)
WHISPER_URLS = {
    "base": "https://openaipublic.azureedge.net/main/whisper/models/ed3a0b6b1c0edf879ad9b11b1af5a0e6ab5db9205f891f668f8b0e6c6326e34e/base.pt",
    "tiny": "https://openaipublic.azureedge.net/main/whisper/models/65147644a518d12f04e32d6f3b26facc3f8dd46e5390956a9424a650c0ce22b9/tiny.pt",
}

DEFAULT_FFMPEG_ZIP = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"

SERVER_ROOT = Path(__file__).resolve().parent.parent
MODELS_WHISPER = SERVER_ROOT / "models" / "whisper"
BIN_DIR = SERVER_ROOT / "bin"

CHUNK = 1024 * 1024  # 1 MiB
PROGRESS_EVERY_BYTES = 5 * 1024 * 1024  # log every 5 MiB


def _human_mb(n: float) -> str:
    return f"{n / (1024 * 1024):.1f} MiB"


def _download(
    url: str,
    dest: Path,
    label: str,
) -> None:
    """Stream download with periodic progress (MB written + avg MB/s)."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(dest.suffix + ".part")

    print(f"[assets] GET {label}")
    print(f"[assets] URL: {url}")
    print(f"[assets] -> {dest}")
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "AI-Presentation-Coach-assets/1.0"},
    )

    t0 = time.perf_counter()
    written = 0
    last_log_at = 0

    try:
        with urllib.request.urlopen(req, timeout=600) as resp:
            cl = resp.headers.get("Content-Length")
            if cl and cl.isdigit():
                print(f"[assets] Content-Length: {_human_mb(int(cl))} (reported)")

            with open(tmp, "wb") as out:
                while True:
                    chunk = resp.read(CHUNK)
                    if not chunk:
                        break
                    out.write(chunk)
                    written += len(chunk)
                    if written - last_log_at >= PROGRESS_EVERY_BYTES or not chunk:
                        elapsed = max(time.perf_counter() - t0, 1e-6)
                        speed = (written / (1024 * 1024)) / elapsed
                        print(
                            f"[assets] ... {label}: {_human_mb(float(written))} written, "
                            f"~{speed:.2f} MiB/s elapsed {elapsed:.0f}s"
                        )
                        last_log_at = written

        tmp.replace(dest)
    except KeyboardInterrupt:
        print(f"\n[assets] Interrupted. Partial file left at: {tmp}", file=sys.stderr)
        print("[assets] Delete the .part file and re-run to start clean.", file=sys.stderr)
        raise
    except Exception:
        if tmp.is_file():
            try:
                tmp.unlink()
            except OSError:
                pass
        raise

    elapsed = max(time.perf_counter() - t0, 1e-6)
    print(f"[assets] OK {label}: {dest.stat().st_size} bytes total in {elapsed:.1f}s")


def download_whisper(model_name: str) -> None:
    model_name = model_name.strip().lower()
    if model_name not in WHISPER_URLS:
        raise ValueError(f"Unsupported whisper model: {model_name!r} (use base or tiny)")
    url = WHISPER_URLS[model_name]
    dest = MODELS_WHISPER / f"{model_name}.pt"
    MODELS_WHISPER.mkdir(parents=True, exist_ok=True)
    if dest.is_file() and dest.stat().st_size > 1_000_000:
        print(f"[assets] {model_name}.pt already present ({_human_mb(dest.stat().st_size)}), skipping.")
        return
    _download(url, dest, f"whisper-{model_name}.pt")


def download_ffmpeg_windows(zip_url: str) -> None:
    if sys.platform != "win32":
        print("[assets] Non-Windows: skipping FFmpeg zip. Install ffmpeg/ffprobe via your package manager.")
        return

    BIN_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = BIN_DIR / "_ffmpeg_win64_gpl.zip"

    if (BIN_DIR / "ffmpeg.exe").is_file() and (BIN_DIR / "ffprobe.exe").is_file():
        print(f"[assets] ffmpeg.exe + ffprobe.exe already in {BIN_DIR}, skipping.")
        return

    _download(zip_url, zip_path, "ffmpeg-windows-zip")

    try:
        # Identify exact filenames inside the ZIP (case-insensitive).
        with zipfile.ZipFile(zip_path, "r") as zf:
            members = zf.namelist()
            ffmpeg_members = [m for m in members if m.lower().endswith("ffmpeg.exe")]
            ffprobe_members = [m for m in members if m.lower().endswith("ffprobe.exe")]

            print(f"[assets] ZIP entries: {len(members)}")
            print(f"[assets] ffmpeg.exe members found: {len(ffmpeg_members)}")
            print(f"[assets] ffprobe.exe members found: {len(ffprobe_members)}")

            if not ffmpeg_members or not ffprobe_members:
                candidates_ffmpeg = [m for m in members if "ffmpeg" in m.lower()][:20]
                candidates_ffprobe = [m for m in members if "ffprobe" in m.lower()][:20]
                raise RuntimeError(
                    "ffmpeg/ffprobe.exe not found inside the downloaded ZIP.\n"
                    f"ffmpeg candidates (sample): {candidates_ffmpeg}\n"
                    f"ffprobe candidates (sample): {candidates_ffprobe}"
                )

            ffmpeg_member = ffmpeg_members[0]
            ffprobe_member = ffprobe_members[0]
            print(f"[assets] Using zip members:\n  ffmpeg: {ffmpeg_member}\n  ffprobe: {ffprobe_member}")

        # Extract only the required two members.
        print("[assets] Extracting selected FFmpeg binaries...")
        t_ext = time.perf_counter()
        with tempfile.TemporaryDirectory(prefix="ffmpeg_extract_") as tmpdir:
            tmp_root = Path(tmpdir)
            with zipfile.ZipFile(zip_path, "r") as zf:
                zf.extract(ffmpeg_member, tmp_root)
                zf.extract(ffprobe_member, tmp_root)

            ffmpeg_extracted = tmp_root / ffmpeg_member
            ffprobe_extracted = tmp_root / ffprobe_member

            if not ffmpeg_extracted.is_file():
                raise RuntimeError(f"Extracted ffmpeg.exe missing: {ffmpeg_extracted}")
            if not ffprobe_extracted.is_file():
                raise RuntimeError(f"Extracted ffprobe.exe missing: {ffprobe_extracted}")

            shutil.copy2(ffmpeg_extracted, BIN_DIR / "ffmpeg.exe")
            shutil.copy2(ffprobe_extracted, BIN_DIR / "ffprobe.exe")

        print(f"[assets] Installed {BIN_DIR / 'ffmpeg.exe'}")
        print(f"[assets] Installed {BIN_DIR / 'ffprobe.exe'}")
        print(f"[assets] FFmpeg install done in {time.perf_counter() - t_ext:.1f}s")
    finally:
        try:
            zip_path.unlink(missing_ok=True)
        except AttributeError:
            if zip_path.is_file():
                zip_path.unlink()


def main() -> int:
    parser = argparse.ArgumentParser(description="Download Whisper weights + Windows FFmpeg into server/")
    parser.add_argument("--skip-ffmpeg", action="store_true", help="Do not download FFmpeg")
    parser.add_argument("--skip-whisper", action="store_true", help="Do not download Whisper")
    parser.add_argument("--whisper-only", action="store_true", help="Only Whisper (same as --skip-ffmpeg)")
    parser.add_argument("--ffmpeg-only", action="store_true", help="Only FFmpeg ZIP (same as --skip-whisper)")
    parser.add_argument("--whisper", choices=("base", "tiny"), default="base")
    args = parser.parse_args()

    skip_ffmpeg = args.skip_ffmpeg or args.whisper_only
    skip_whisper = args.skip_whisper or args.ffmpeg_only

    if args.whisper_only and args.ffmpeg_only:
        print("[assets] Choose one of --whisper-only or --ffmpeg-only (not both).", file=sys.stderr)
        return 2

    print(f"[assets] SERVER_ROOT={SERVER_ROOT}")
    if not skip_whisper and not skip_ffmpeg:
        print("[assets] Mode: FULL (Whisper + FFmpeg) — expect several minutes on a typical connection.")
        print("[assets] Tip: run with --whisper-only if ffmpeg is already installed on PATH.")

    try:
        if not skip_whisper:
            download_whisper(args.whisper)
        if not skip_ffmpeg:
            zip_url = os.getenv("FFMPEG_ZIP_URL", DEFAULT_FFMPEG_ZIP)
            download_ffmpeg_windows(zip_url)
    except urllib.error.HTTPError as e:
        print(f"[assets] HTTP ERROR {e.code}: {e.reason}", file=sys.stderr)
        return 1
    except urllib.error.URLError as e:
        print(f"[assets] NETWORK ERROR: {e}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"[assets] FAILED: {e}", file=sys.stderr)
        return 1

    print("[assets] Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
