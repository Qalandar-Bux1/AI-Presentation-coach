/**
 * AI Presentation Coach — Electron main process.
 * - Spawns bundled backend.exe (Flask; default port 5000 via FLASK_PORT)
 * - Spawns Next.js standalone (default port 3000; auto-increments if busy)
 * - Opens BrowserWindow (no separate browser install required)
 */
const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const net = require("net");
const { spawn } = require("child_process");
const http = require("http");

/** Next.js server (standalone); falls back if 3000 is taken. */
const FRONTEND_PORT_START = parseInt(process.env.ELECTRON_FRONTEND_PORT || "3000", 10);
/** Must match client fetches (see NEXT_PUBLIC_API_URL / hardcoded localhost:5000). */
const BACKEND_HOST = "127.0.0.1";
const BACKEND_PORT = parseInt(process.env.ELECTRON_BACKEND_PORT || "5000", 10);

const DEV_MODE = process.env.ELECTRON_DEV === "1";
const DEV_FRONTEND_URL = process.env.ELECTRON_DEV_URL || "http://127.0.0.1:3000";

let mainWindow = null;
let backendProc = null;
let frontendProc = null;

let logFilePath = null;

function ensureLogFile() {
  try {
    const logsDir = path.join(app.getPath("userData"), "logs");
    fs.mkdirSync(logsDir, { recursive: true });
    logFilePath = path.join(logsDir, "desktop.log");
  } catch (_) {
    logFilePath = null;
  }
}

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args
    .map((a) => (a instanceof Error ? a.stack || a.message : String(a)))
    .join(" ")}\n`;

  try {
    process.stdout.write(line);
  } catch (_) {}

  if (logFilePath) {
    try {
      fs.appendFileSync(logFilePath, line, "utf8");
    } catch (_) {}
  }
}

function attachChildLogging(child, name) {
  if (!child) return;
  if (child.stdout) {
    child.stdout.on("data", (d) => log(`[${name}:stdout]`, d.toString().trimEnd()));
  }
  if (child.stderr) {
    child.stderr.on("data", (d) => log(`[${name}:stderr]`, d.toString().trimEnd()));
  }
  child.on("error", (err) => log(`[${name}] process error:`, err));
}

function waitForPort(port, host, timeoutMs) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.createConnection({ port, host }, () => {
        socket.end();
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout waiting for ${host}:${port}`));
        } else {
          setTimeout(attempt, 250);
        }
      });
    };
    attempt();
  });
}

/**
 * Find first port >= startPort that can be bound on host (avoids Next.js EADDRINUSE).
 */
function findAvailablePort(host, startPort, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let port = startPort;
    const tryListen = () => {
      if (port >= startPort + maxAttempts) {
        reject(new Error(`No free port between ${startPort} and ${startPort + maxAttempts - 1}`));
        return;
      }
      const srv = net.createServer();
      srv.once("error", () => {
        try {
          srv.close();
        } catch (_) {}
        port += 1;
        tryListen();
      });
      srv.listen({ port, host }, () => {
        srv.close(() => resolve(port));
      });
    };
    tryListen();
  });
}

function resolveExistingPath(candidates) {
  for (const p of candidates) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch (_) {}
  }
  return null;
}

function getBackendExePath() {
  const candidates = app.isPackaged
    ? [
        path.join(process.resourcesPath, "backend.exe"),
        path.join(path.dirname(process.execPath), "resources", "backend.exe"),
        path.join(path.dirname(app.getAppPath()), "backend.exe"),
      ]
    : [path.join(__dirname, "resources", "backend.exe")];

  const resolved = resolveExistingPath(candidates);
  if (!resolved) {
    throw new Error(`backend.exe not found in any expected location: ${candidates.join(" | ")}`);
  }
  return resolved;
}

function getFrontendOutDir() {
  const candidates = app.isPackaged
    ? [
        path.join(process.resourcesPath, "frontend", "standalone"),
        path.join(path.dirname(process.execPath), "resources", "frontend", "standalone"),
      ]
    : [path.join(__dirname, "resources", "frontend", "standalone")];
  const resolved = resolveExistingPath(candidates);
  if (!resolved) {
    throw new Error(
      `Next standalone folder not found in expected locations: ${candidates.join(" | ")}`
    );
  }
  return resolved;
}

function killBackendProc() {
  if (backendProc && !backendProc.killed) {
    try {
      backendProc.kill("SIGTERM");
    } catch (_) {
      try {
        backendProc.kill();
      } catch (_) {}
    }
  }
  backendProc = null;
}

function killFrontendProc() {
  if (frontendProc && !frontendProc.killed) {
    try {
      frontendProc.kill("SIGTERM");
    } catch (_) {
      try {
        frontendProc.kill();
      } catch (_) {}
    }
  }
  frontendProc = null;
}

function shutdown() {
  killFrontendProc();
  killBackendProc();
}

function startBackendOnce(frontendPort) {
  const exe = getBackendExePath();
  const cwd = path.dirname(exe);
  log("[electron] Starting backend:", exe, "cwd:", cwd);

  const corsOrigins = [
    `http://127.0.0.1:${frontendPort}`,
    `http://localhost:${frontendPort}`,
    "http://127.0.0.1:3000",
    "http://localhost:3000",
  ].join(",");

  const childEnv = {
    ...process.env,
    FLASK_PORT: String(BACKEND_PORT),
    PORT: String(BACKEND_PORT),
    CORS_ORIGINS: corsOrigins,
  };

  backendProc = spawn(exe, [], {
    cwd,
    env: childEnv,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: app.isPackaged,
  });
  attachChildLogging(backendProc, "backend");
  backendProc.on("exit", (code) => {
    log("[electron] backend.exe exited with code", code);
  });

  const backendWaitMs = app.isPackaged ? 180000 : 120000;
  return waitForPort(BACKEND_PORT, BACKEND_HOST, backendWaitMs).then(async () => {
    const healthUrl = `http://${BACKEND_HOST}:${BACKEND_PORT}/health/db`;
    try {
      const ok = await new Promise((resolve) => {
        const req = http.get(healthUrl, (res) => {
          let body = "";
          res.on("data", (d) => (body += d));
          res.on("end", () => {
            try {
              const json = JSON.parse(body || "{}");
              resolve(Boolean(json && json.success));
            } catch (_) {
              resolve(false);
            }
          });
        });
        req.on("error", () => resolve(false));
        req.setTimeout(5000, () => {
          req.destroy();
          resolve(false);
        });
      });
      if (ok) {
        log("[electron] Backend DB health OK:", healthUrl);
      } else {
        log(
          "[electron] Backend DB health NOT OK yet; continuing (DB-backed endpoints may fail until fixed):",
          healthUrl
        );
      }
    } catch (err) {
      log("[electron] Backend DB health check failed; continuing:", err);
    }
  });
}

async function startBackendWithRetry(frontendPort) {
  const attempts = 3;
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      log(`[electron] Backend start attempt ${i}/${attempts}`);
      await startBackendOnce(frontendPort);
      log("[electron] Backend ready on port", BACKEND_PORT);
      return;
    } catch (err) {
      lastErr = err;
      log(`[electron] Backend start attempt ${i} failed:`, err && err.message ? err.message : err);
      killBackendProc();
      if (i < attempts) {
        log("[electron] Retrying backend in 2s…");
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }
  throw lastErr || new Error("Backend failed to start");
}

function startNextServer(frontendPort) {
  const standaloneDir = getFrontendOutDir();
  const serverJs = path.join(standaloneDir, "server.js");
  if (!fs.existsSync(serverJs)) {
    throw new Error(
      `Next standalone server not found.\nExpected: ${serverJs}\n` +
        `Run: cd client && npm run build:desktop then: powershell -ExecutionPolicy Bypass -File scripts\\prepare-desktop-resources.ps1`
    );
  }

  const env = {
    ...process.env,
    PORT: String(frontendPort),
    HOSTNAME: "127.0.0.1",
    NEXT_TELEMETRY_DISABLED: "1",
    // In packaged mode, process.execPath is the app's Electron binary.
    // This flag makes that binary behave like Node to run Next's standalone server.js.
    ELECTRON_RUN_AS_NODE: "1",
  };

  const cwd = standaloneDir;
  log("[electron] Starting Next server:", serverJs, "PORT=", frontendPort, "cwd:", cwd);

  frontendProc = spawn(process.execPath, [serverJs], {
    cwd,
    env,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: app.isPackaged,
  });

  attachChildLogging(frontendProc, "frontend");

  frontendProc.on("exit", (code) => {
    log("[electron] Next server exited with code", code);
  });

  return waitForPort(frontendPort, "127.0.0.1", 120000);
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    title: "AI Presentation Coach",
    width: 1400,
    height: 900,
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    mainWindow.webContents.on("before-input-event", (_event, input) => {
      if (input.control && input.shift && (input.key === "I" || input.key === "i")) {
        _event.preventDefault();
      }
    });
  }

  await mainWindow.loadFile(path.join(__dirname, "loading.html"));

  try {
    if (DEV_MODE) {
      log("[electron] ELECTRON_DEV=1 — not spawning servers; waiting for", DEV_FRONTEND_URL);
      let devPort = 3000;
      let devHost = "127.0.0.1";
      try {
        const u = new URL(DEV_FRONTEND_URL);
        devHost = u.hostname || "127.0.0.1";
        devPort = u.port ? parseInt(u.port, 10) : u.protocol === "https:" ? 443 : 80;
      } catch (_) {}
      await waitForPort(devPort, devHost, 120000).catch(() => {
        log("[electron] Dev: port wait timed out; loading URL anyway");
      });
      await mainWindow.loadURL(DEV_FRONTEND_URL);
      if (process.env.ELECTRON_OPEN_DEVTOOLS === "1") {
        mainWindow.webContents.openDevTools({ mode: "detach" });
      }
      mainWindow.on("closed", () => {
        mainWindow = null;
      });
      return;
    }

    let frontendPort = FRONTEND_PORT_START;
    try {
      frontendPort = await findAvailablePort("127.0.0.1", FRONTEND_PORT_START);
      if (frontendPort !== FRONTEND_PORT_START) {
        log(
          `[electron] Fallback triggered: port ${FRONTEND_PORT_START} busy; using frontend port ${frontendPort}`
        );
      }
    } catch (e) {
      log("[electron] findAvailablePort failed, using default:", FRONTEND_PORT_START, e);
    }

    log("[electron] Frontend port:", frontendPort, "(CORS will allow this origin)");
    await startBackendWithRetry(frontendPort);
    await startNextServer(frontendPort);

    const appUrl = `http://127.0.0.1:${frontendPort}/`;
    log("[electron] Loading UI:", appUrl);
    await mainWindow.loadURL(appUrl);
  } catch (err) {
    log("[electron] Startup failed:", err);
    try {
      await dialog.showMessageBox(mainWindow, {
        type: "error",
        title: "Startup failed",
        message: "Could not start the app services.",
        detail: `${err && err.message ? err.message : String(err)}${
          logFilePath ? `\n\nLog file:\n${logFilePath}` : ""
        }`,
      });
    } catch (_) {}
    throw err;
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  if (process.platform === "win32") {
    try {
      app.setAppUserModelId("com.aipresentationcoach.app");
    } catch (_) {}
  }

  ensureLogFile();

  process.on("uncaughtException", (err) => {
    log("[electron] uncaughtException:", err);
  });

  process.on("unhandledRejection", (reason) => {
    log("[electron] unhandledRejection:", reason);
  });

  createWindow().catch((err) => {
    log("[electron] Failed to start:", err);
    try {
      const details = logFilePath ? `\n\nLog: ${logFilePath}` : "";
      dialog.showErrorBox(
        "AI Presentation Coach failed to start",
        `${err && err.message ? err.message : String(err)}${details}`
      );
    } catch (_) {}
    shutdown();
    app.quit();
  });
});

app.on("window-all-closed", () => {
  shutdown();
  app.quit();
});

app.on("before-quit", () => {
  shutdown();
});
