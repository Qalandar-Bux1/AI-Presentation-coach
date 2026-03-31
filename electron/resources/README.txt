Place packaged assets here before running "npm run dist" from the electron\ folder:

1) backend.exe
   Copy from: ..\server\dist\backend.exe
   To:        electron\resources\backend.exe

2) Next.js standalone server (BUILD_DESKTOP=1 build output)
   Copy folder: ..\client\.next\standalone\
   To:          electron\resources\frontend\standalone\

Optional (safe): copy public assets
   Copy folder: ..\client\public\
   To:          electron\resources\frontend\public\

Optional: copy server\.env next to backend build inputs (PyInstaller can bundle it — see server\pyinstaller_backend.spec).

Also ensure Whisper weights exist under server\models\whisper\ and FFmpeg under server\bin\ before PyInstaller build.

Dev (Electron shell only, you run Flask + Next yourself):
  cd electron && npm run dev
  Set ELECTRON_DEV_URL if not using http://127.0.0.1:3000
  Backend must stay on port 5000 unless you rebuild the client with matching NEXT_PUBLIC_API_URL.

Production defaults: Flask 127.0.0.1:5000, Next standalone 127.0.0.1:3000 (auto fallback if 3000 busy).
