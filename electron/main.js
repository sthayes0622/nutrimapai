const { app, BrowserWindow, shell, utilityProcess } = require("electron");
const path = require("path");
const http = require("http");
const fs = require("fs");

// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); process.exit(0); }

const PORT = 3100;
let mainWindow = null;
let serverProcess = null;

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0 && !line.startsWith("#")) {
      env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }
  }
  return env;
}

function startNextServer() {
  const isProd = app.isPackaged;

  const serverJs = isProd
    ? path.join(process.resourcesPath, "server", "server.js")
    : path.join(__dirname, "../.next/standalone/server.js");

  const envFile = isProd
    ? path.join(process.resourcesPath, ".env.local")
    : path.join(__dirname, "../.env.local");

  const env = {
    ...process.env,
    ...loadEnv(envFile),
    PORT: String(PORT),
    HOSTNAME: "127.0.0.1",
    NODE_ENV: "production",
  };

  // utilityProcess.fork runs the script with Electron's bundled Node.js
  serverProcess = utilityProcess.fork(serverJs, [], { env, stdio: "pipe" });

  serverProcess.stdout?.on("data", (d) => process.stdout.write(d));
  serverProcess.stderr?.on("data", (d) => process.stderr.write(d));
  serverProcess.on("exit", (code) => console.log("Server exited with code", code));
}

function waitForServer(retries = 40) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      http.get(`http://localhost:${PORT}`, () => resolve()).on("error", () => {
        if (++attempts >= retries) return reject(new Error("Server did not start"));
        setTimeout(check, 500);
      });
    };
    setTimeout(check, 1000);
  });
}

function createWindow() {
  if (mainWindow) return;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(
    `data:text/html,<html><body style="background:%23f0fdf4;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui"><div style="text-align:center"><div style="font-size:52px;margin-bottom:16px">🥗</div><div style="font-size:20px;font-weight:700;color:%2315803d">NutriMap AI</div><div style="color:%236b7280;margin-top:10px;font-size:14px">Starting up…</div></div></body></html>`
  );

  waitForServer()
    .then(() => { if (mainWindow) mainWindow.loadURL(`http://localhost:${PORT}`); })
    .catch(() => {
      if (mainWindow) mainWindow.loadURL(
        `data:text/html,<html><body style="background:%23fff1f2;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui"><div style="text-align:center;color:%23be123c"><div style="font-size:20px;font-weight:600">Failed to start</div><div style="margin-top:8px;font-size:14px">Please quit and reopen the app.</div></div></body></html>`
      );
    });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(() => {
  startNextServer();
  createWindow();
  app.on("activate", () => { if (!mainWindow) createWindow(); });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) { serverProcess.kill(); serverProcess = null; }
});
