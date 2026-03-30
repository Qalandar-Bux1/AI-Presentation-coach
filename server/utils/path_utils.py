import os
import sys
from pathlib import Path
from typing import Optional


def is_packaged() -> bool:
    """
    Detect PyInstaller onefile/frozen mode.
    """
    return bool(getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"))


def get_project_server_dir() -> str:
    """
    In dev mode, the server directory is the parent of this `utils/` folder.
    """
    return str(Path(__file__).resolve().parent.parent)  # .../server/


def get_base_resource_dir() -> str:
    """
    In packaged mode, PyInstaller extracts files under sys._MEIPASS.
    In dev mode, resources live relative to the server directory.
    """
    if is_packaged():
        return str(getattr(sys, "_MEIPASS"))  # type: ignore[attr-defined]
    return get_project_server_dir()


def resource_path(relative_path: str) -> str:
    """
    Build an absolute path to a bundled resource (works in dev and packaged mode).
    """
    rel = relative_path.lstrip("/\\")
    return str(Path(get_base_resource_dir()).joinpath(rel))


def get_env_path() -> str:
    """
    Expected .env location:
    - dev: server/.env
    - packaged: prefer .env next to backend.exe; else bundled .env inside PyInstaller
    """
    if is_packaged():
        try:
            exe_dir = Path(sys.executable).resolve().parent
            external = exe_dir / ".env"
            if external.is_file():
                return str(external)
        except Exception:
            pass
    return resource_path(".env")


def get_app_roaming_root(app_name: str = "AI Presentation Coach") -> str:
    """
    Store uploads/logs under Windows user roaming profile for persistence.
    """
    appdata = os.getenv("APPDATA")
    if not appdata:
        # Fallback for non-standard environments
        appdata = str(Path.home())
    return str(Path(appdata).joinpath(app_name))


def get_uploads_dir() -> str:
    """
    Uploads location:
    - dev: server/uploads
    - packaged: %APPDATA%/AI Presentation Coach/uploads
    """
    if is_packaged():
        uploads_dir = str(Path(get_app_roaming_root()).joinpath("uploads"))
    else:
        uploads_dir = str(Path(get_project_server_dir()).joinpath("uploads"))

    os.makedirs(uploads_dir, exist_ok=True)
    return uploads_dir


def resolve_uploads_dir(upload_folder_env: Optional[str]) -> str:
    """
    Resolve UPLOAD_FOLDER from env (may be absolute or relative).

    - dev: relative paths are resolved against server directory
    - packaged: relative paths are resolved into the roaming app root (persistent)
    """
    if not upload_folder_env:
        return get_uploads_dir()

    p = Path(upload_folder_env)
    if p.is_absolute():
        uploads_dir = str(p)
    else:
        if is_packaged():
            # Keep uploads persistent in packaged mode.
            uploads_dir = str(Path(get_app_roaming_root()).joinpath(p))
        else:
            uploads_dir = str(Path(get_project_server_dir()).joinpath(p))

    os.makedirs(uploads_dir, exist_ok=True)
    return uploads_dir


def get_whisper_models_dir() -> str:
    return resource_path(str(Path("models").joinpath("whisper")))


def get_ffmpeg_exe_path() -> str:
    return resource_path(str(Path("bin").joinpath("ffmpeg.exe")))


def get_ffprobe_exe_path() -> str:
    return resource_path(str(Path("bin").joinpath("ffprobe.exe")))


def resolve_ffmpeg_executable() -> str:
    """
    Prefer bundled ffmpeg.exe when present; otherwise rely on PATH (dev machines).
    """
    bundled = get_ffmpeg_exe_path()
    if os.path.isfile(bundled):
        return bundled
    if is_packaged():
        raise FileNotFoundError(
            f"Bundled ffmpeg.exe not found: {bundled}\n"
            f"Place ffmpeg.exe under: server\\bin\\ffmpeg.exe before building the desktop app."
        )
    return "ffmpeg"


def resolve_ffprobe_executable() -> str:
    """
    Prefer bundled ffprobe.exe when present; otherwise rely on PATH.
    """
    bundled = get_ffprobe_exe_path()
    if os.path.isfile(bundled):
        return bundled
    if is_packaged():
        raise FileNotFoundError(
            f"Bundled ffprobe.exe not found: {bundled}\n"
            f"Place ffprobe.exe under: server\\bin\\ffprobe.exe before building the desktop app."
        )
    return "ffprobe"


def debug_print_paths(tag: str = "PATHS") -> None:
    try:
        print(f"[{tag}] packaged={is_packaged()}")
        print(f"[{tag}] base_dir={get_base_resource_dir()}")
        print(f"[{tag}] env_path={get_env_path()}")
        print(f"[{tag}] uploads_dir={get_uploads_dir()}")
        print(f"[{tag}] whisper_models_dir={get_whisper_models_dir()}")
        print(f"[{tag}] ffmpeg_exe_path={get_ffmpeg_exe_path()} (resolved={resolve_ffmpeg_executable()})")
        print(f"[{tag}] ffprobe_exe_path={get_ffprobe_exe_path()} (resolved={resolve_ffprobe_executable()})")
    except Exception as exc:
        print(f"[{tag}] debug_print_paths failed: {exc}")

