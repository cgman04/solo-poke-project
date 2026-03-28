const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");
const fs = require("fs");

const distPath = path.join(__dirname, "..", "dist");

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// Register custom scheme before app is ready (required by Electron)
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);

function createWindow() {
  // Register protocol handler to serve dist files (works inside asar)
  protocol.handle("app", (request) => {
    const reqUrl = new URL(request.url);
    let urlPath = decodeURIComponent(reqUrl.pathname);
    // Remove leading slash on Windows
    if (urlPath.startsWith("/")) urlPath = urlPath.slice(1);

    const filePath = path.normalize(path.join(distPath, urlPath));

    // Prevent path traversal outside dist
    if (!filePath.startsWith(distPath)) {
      return new Response("Forbidden", { status: 403 });
    }

    try {
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      return new Response(data, {
        headers: {
          "Content-Type": mimeTypes[ext] || "application/octet-stream",
        },
      });
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  });

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Always use the custom protocol — works both packaged and unpackaged
  win.loadURL("app://bundle/index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
