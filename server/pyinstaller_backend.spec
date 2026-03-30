# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec for Flask backend (Windows onefile).

Run from `server` directory:
  pip install pyinstaller
  pyinstaller pyinstaller_backend.spec

Output: server\\dist\\backend.exe

Tip: first builds are slow — torch + whisper pull in many submodules.
"""
import sys
from pathlib import Path

block_cipher = None

# Use the spec file location as the project root.
# NOTE: When PyInstaller execs a .spec, `__file__` is not defined.
try:
    ROOT = Path(SPECPATH).resolve().parent  # provided by PyInstaller
except NameError:
    ROOT = Path.cwd()

# Robust root detection (PyInstaller can exec specs with varying CWD).
# We must end up pointing to the `server/` folder containing `app.py`.
root_candidates = [Path.cwd(), Path.cwd() / "server"]
for cand in root_candidates:
    if (cand / "app.py").is_file():
        ROOT = cand
        break

# Bundle Whisper weights + FFmpeg (place files before build — or use download script).
datas = [
    (str(ROOT / "models" / "whisper"), "models/whisper"),
    (str(ROOT / "bin"), "bin"),
]
# Optional: ship .env next to frozen app (copy to server\\.env before build, or omit extra).
env_file = ROOT / ".env"
if env_file.is_file():
    datas.append((str(env_file), "."))

binaries = []
hiddenimports = [
    "engineio",
    "dns",
    "jwt",
    "flask",
    "flask_cors",
    "pymongo",
    "bson",
    "bcrypt",
    "cv2",
    "mediapipe",
    "librosa",
    "soundfile",
    "whisper",
    "torch",
    "torchaudio",
    "openai",
    "sklearn",
    "sklearn.utils._weight_vector",
    "nltk",
    "textstat",
    "PIL",
    "dotenv",
    # stdlib modules that NLTK needs but PyInstaller may exclude
    "pydoc",
]

# Best-effort: pull full dependency trees for heavy stacks (increases build time & EXE size).
try:
    from PyInstaller.utils.hooks import collect_all
    # Keep collect_all limited to reduce build time drastically.
    # Torch/CV/MediaPipe are still included via normal import graph.
    for pkg in ("whisper",):
        try:
            tmp_d, tmp_b, tmp_h = collect_all(pkg)
            datas += tmp_d
            binaries += tmp_b
            hiddenimports += tmp_h
        except Exception:
            pass
except Exception:
    pass

a = Analysis(
    [str(ROOT / "app.py")],
    pathex=[str(ROOT)],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    # Exclude large optional tooling/GUI stacks that are not used at runtime.
    # This speeds up packaging significantly and reduces binary size.
    excludes=[
        "IPython",
        "matplotlib",
        "matplotlib.pyplot",
        "tkinter",
        "tcl",
        "tk",
        "jedi",
        "pytest",
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="backend",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
