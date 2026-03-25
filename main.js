const { app, BrowserWindow, ipcMain, shell, protocol, screen, globalShortcut, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execFile } = require("child_process");

const APP_PROTOCOL = "app";
const META_FILENAME = "meta.json";
const MANIFEST_FILENAME = "manifest.json";
const DEFAULT_META = {
    phase: "start",
    ending: "",
    seenFakeRestart: false,
    artifactSeed: 0
};

protocol.registerSchemesAsPrivileged([
    {
        scheme: APP_PROTOCOL,
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true
        }
    }
]);

let mainWindow = null;
let cmdWindow = null;
let editorWindow = null;
let pendingTerminalChoice = null;
let cmdReady = false;
const cmdQueue = [];
const CMD_ONLY = process.argv.includes("--cmd-only");
const EDITOR_ONLY = process.argv.includes('--editor');

function ensureDir(target) {
    try {
        fs.mkdirSync(target, { recursive: true });
    } catch (err) {
        // ignore
    }
}

function getArtifactsRoot() {
    const docs = app.getPath("documents");
    return path.join(docs, "Flavortown");
}

function getUserDataPath() {
    return app.getPath("userData");
}

function getDraftsRoot() {
    if (app.isPackaged) {
        return path.join(getUserDataPath(), "_drafts");
    }
    return path.join(__dirname, "_drafts");
}

function getManifestPath() {
    return path.join(getUserDataPath(), MANIFEST_FILENAME);
}

function getMetaPath() {
    return path.join(getUserDataPath(), META_FILENAME);
}

function loadJson(pathname, fallback) {
    try {
        if (!fs.existsSync(pathname)) {
            return fallback;
        }
        const raw = fs.readFileSync(pathname, "utf8");
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch (err) {
        return fallback;
    }
}

function saveJson(pathname, payload) {
    try {
        ensureDir(path.dirname(pathname));
        fs.writeFileSync(pathname, JSON.stringify(payload, null, 2), "utf8");
    } catch (err) {
        // ignore
    }
}

function loadManifest() {
    return loadJson(getManifestPath(), { version: 1, files: {} });
}

function saveManifest(manifest) {
    saveJson(getManifestPath(), manifest);
}

function loadMeta() {
    return { ...DEFAULT_META, ...loadJson(getMetaPath(), {}) };
}

function saveMeta(meta) {
    saveJson(getMetaPath(), meta);
    return meta;
}

function runCommand(command, args, timeoutMs) {
    return new Promise((resolve) => {
        execFile(command, args, { timeout: timeoutMs || 1200, windowsHide: true }, (error, stdout) => {
            if (error) {
                resolve("");
                return;
            }
            resolve(String(stdout || ""));
        });
    });
}

function sanitizeRelPath(relPath) {
    if (typeof relPath !== "string") {
        return null;
    }
    const trimmed = relPath.trim();
    if (!trimmed) {
        return null;
    }
    if (path.isAbsolute(trimmed)) {
        return null;
    }
    const normalized = path.normalize(trimmed).replace(/^([\\/])+/, "");
    if (normalized.split(path.sep).includes("..")) {
        return null;
    }
    return normalized.replace(/\\/g, "/");
}

function resolveArtifactPath(relPath) {
    const normalized = sanitizeRelPath(relPath);
    if (!normalized) {
        return null;
    }
    const root = getArtifactsRoot();
    const fullPath = path.resolve(root, normalized);
    if (!fullPath.startsWith(path.resolve(root))) {
        return null;
    }
    return { root, relPath: normalized, fullPath };
}

function resolveProjectDraftPath(relPath) {
    const normalized = sanitizeRelPath(relPath);
    if (!normalized) {
        return null;
    }
    if (!(normalized === "_drafts" || normalized.startsWith("_drafts/"))) {
        return null;
    }
    const root = getDraftsRoot();
    const inside = normalized.replace(/^_drafts[\\/]/, "").replace(/^_drafts$/, "");
    const fullPath = inside ? path.join(root, inside) : root;
    return { root, relPath: normalized, fullPath };
}

function cleanupExpiredFiles() {
    const manifest = loadManifest();
    const now = Date.now();
    const files = manifest.files || {};
    let changed = false;
    Object.keys(files).forEach(function (key) {
        const entry = files[key];
        if (!entry || entry.persistent) {
            return;
        }
        if (!entry.expiresAt || entry.expiresAt <= 0) {
            return;
        }
        if (now < entry.expiresAt) {
            return;
        }
        const target = resolveArtifactPath(key);
        if (target) {
            try {
                if (fs.existsSync(target.fullPath)) {
                    fs.unlinkSync(target.fullPath);
                }
            } catch (err) {
                // ignore
            }
        }
        delete files[key];
        changed = true;
    });
    if (changed) {
        manifest.files = files;
        saveManifest(manifest);
    }
    return manifest;
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 960,
        minHeight: 540,
        backgroundColor: "#0b0b0e",
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    loadWindowWithFallback(mainWindow, `${APP_PROTOCOL}://app/index.html`, path.join(__dirname, "index.html"));

    mainWindow.on("closed", function () {
        mainWindow = null;
    });
}

function createEditorWindow() {
    const workArea = screen.getPrimaryDisplay().workAreaSize;
    const width = Math.max(1100, Math.min(1600, workArea.width));
    const height = Math.max(700, Math.min(1000, workArea.height));

    editorWindow = new BrowserWindow({
        width: width,
        height: height,
        minWidth: 1100,
        minHeight: 700,
        backgroundColor: "#0b0c10",
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    editorWindow.maximize();
    loadWindowWithFallback(editorWindow, `${APP_PROTOCOL}://app/editor.html`, path.join(__dirname, "editor.html"));
    editorWindow.on('closed', function () {
        editorWindow = null;
    });
    return editorWindow;
}

function createCmdWindow() {
    if (cmdWindow && !cmdWindow.isDestroyed()) {
        return cmdWindow;
    }

    cmdWindow = new BrowserWindow({
        width: 720,
        height: 440,
        backgroundColor: "#060606",
        show: false,
        resizable: true,
        title: "C:\\Windows\\System32\\cmd.exe",
        icon: path.join(__dirname, "assets", "cmd-icon.png"),
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            preload: path.join(__dirname, "cmd_preload.js")
        }
    });

    loadWindowWithFallback(cmdWindow, `${APP_PROTOCOL}://app/cmd.html`, path.join(__dirname, "cmd.html"));
    cmdReady = false;

    cmdWindow.webContents.on("did-finish-load", function () {
        cmdReady = true;
        while (cmdQueue.length) {
            const item = cmdQueue.shift();
            if (item) {
                cmdWindow.webContents.send(item.channel, item.payload);
            }
        }
    });

    cmdWindow.on("closed", function () {
        cmdWindow = null;
        cmdReady = false;
        cmdQueue.length = 0;
        if (pendingTerminalChoice) {
            pendingTerminalChoice({ key: null, canceled: true });
            pendingTerminalChoice = null;
        }
    });

    return cmdWindow;
}

function loadWindowWithFallback(win, url, fallbackPath) {
    if (!win) {
        return;
    }
    let triedFallback = false;
    const attemptFallback = function () {
        if (triedFallback) {
            return;
        }
        triedFallback = true;
        if (fallbackPath) {
            win.loadFile(fallbackPath).catch(function () {});
        }
    };

    win.webContents.on("did-fail-load", function (_event, _code, _desc, validatedURL) {
        if (validatedURL && typeof validatedURL === "string" && validatedURL.startsWith(`${APP_PROTOCOL}://`)) {
            attemptFallback();
        }
    });

    win.loadURL(url).catch(function () {
        attemptFallback();
    });
}

function getDefaultCmdPath() {
    let username = "User";
    try {
        const info = os.userInfo();
        if (info && info.username) {
            username = info.username;
        }
    } catch (error) {
        // ignore
    }
    return "C:\\Users\\" + username;
}

function sendToCmd(channel, payload) {
    if (!cmdWindow || cmdWindow.isDestroyed()) {
        return;
    }
    if (!cmdReady) {
        cmdQueue.push({ channel, payload });
        return;
    }
    cmdWindow.webContents.send(channel, payload);
}

app.whenReady().then(function () {
    ensureDir(getArtifactsRoot());
    ensureDir(getUserDataPath());
    cleanupExpiredFiles();

    protocol.registerFileProtocol(APP_PROTOCOL, function (request, callback) {
        try {
            const parsed = new URL(request.url);
            const decodedPath = decodeURIComponent(parsed.pathname || "/");
            const relative = decodedPath === "/" ? "/index.html" : decodedPath;
            const stripped = relative.replace(/^([\\/])+/, "");
            const safePath = path.normalize(path.join(__dirname, stripped || "index.html"));
            if (!safePath.startsWith(path.normalize(__dirname + path.sep))) {
                callback({ error: -6 });
                return;
            }
            callback({ path: safePath });
        } catch (err) {
            callback({ error: -6 });
        }
    });

    if (CMD_ONLY) {
        const win = createCmdWindow();
        win.show();
        sendToCmd("cmd:open", { path: getDefaultCmdPath(), mode: "free" });
    } else if (EDITOR_ONLY) {
        createEditorWindow();
    } else {
        createMainWindow();
    }
        globalShortcut.register("Ctrl+Alt+E", function () {
        if (editorWindow && !editorWindow.isDestroyed()) {
            if (editorWindow.isMinimized()) {
                editorWindow.restore();
            }
            editorWindow.show();
            editorWindow.focus();
        }
    });

    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            if (CMD_ONLY) {
                const win = createCmdWindow();
                win.show();
                sendToCmd("cmd:open", { path: getDefaultCmdPath(), mode: "free" });
            } else if (EDITOR_ONLY) {
                createEditorWindow();
            } else {
                createMainWindow();
            }
        }
    });
});

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

ipcMain.handle("meta:get", function () {
    return loadMeta();
});

ipcMain.handle("meta:set", function (_event, payload) {
    const current = loadMeta();
    const next = payload && typeof payload === "object" ? { ...current, ...payload } : current;
    return saveMeta(next);
});

ipcMain.handle("user:getProfile", async function () {
    const candidates = new Set();

    try {
        const info = os.userInfo();
        if (info && info.username) {
            candidates.add(String(info.username));
        }
    } catch (err) {
        // ignore
    }

    if (process.env.USERNAME) {
        candidates.add(String(process.env.USERNAME));
    }

    try {
        const home = os.homedir();
        if (home) {
            candidates.add(path.basename(home));
        }
    } catch (err) {
        // ignore
    }

    if (process.platform === "win32") {
        const regOutput = await runCommand("reg", ["query", "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion", "/v", "RegisteredOwner"], 1200);
        if (regOutput) {
            const match = regOutput.match(/RegisteredOwner\\s+REG_\\w+\\s+(.+)/i);
            if (match && match[1]) {
                candidates.add(match[1].trim());
            }
        }

        const username = process.env.USERNAME ? String(process.env.USERNAME) : "";
        if (username) {
            const wmicOutput = await runCommand("wmic", ["useraccount", "where", `name=\"${username}\"`, "get", "fullname"], 1200);
            if (wmicOutput) {
                const lines = wmicOutput.split(/\\r?\\n/).map((line) => line.trim()).filter(Boolean);
                const fullName = lines.find((line) => line.toLowerCase() !== "fullname");
                if (fullName) {
                    candidates.add(fullName);
                }
            }
        }
    }

    return Array.from(candidates);
});


ipcMain.handle("project:writeText", function (_event, payload) {
    const relPath = payload && (payload.relPath || payload.path || payload.name);
    const content = payload && (payload.content !== undefined ? payload.content : payload.text);
    const resolved = resolveProjectDraftPath(String(relPath || ""));
    if (!resolved || !resolved.fullPath || resolved.fullPath === resolved.root) {
        return { ok: false, error: "invalid_path" };
    }
    ensureDir(path.dirname(resolved.fullPath));
    fs.writeFileSync(resolved.fullPath, String(content !== undefined ? content : ""), "utf8");
    return { ok: true, relPath: resolved.relPath };
});

ipcMain.handle("project:readText", function (_event, payload) {
    const relPath = payload && (payload.relPath || payload.path || payload.name);
    const resolved = resolveProjectDraftPath(String(relPath || ""));
    if (!resolved || !resolved.fullPath || resolved.fullPath === resolved.root) {
        return { ok: false, error: "invalid_path" };
    }
    if (!fs.existsSync(resolved.fullPath)) {
        return { ok: false, error: "not_found" };
    }
    const text = fs.readFileSync(resolved.fullPath, "utf8");
    return { ok: true, relPath: resolved.relPath, content: text };
});

ipcMain.handle("project:delete", function (_event, payload) {
    const relPath = payload && (payload.relPath || payload.path || payload.name);
    const resolved = resolveProjectDraftPath(String(relPath || ""));
    if (!resolved || !resolved.fullPath || resolved.fullPath === resolved.root) {
        return { ok: false, error: "invalid_path" };
    }
    try {
        if (fs.existsSync(resolved.fullPath)) {
            fs.unlinkSync(resolved.fullPath);
        }
    } catch (err) {
        return { ok: false, error: "delete_failed" };
    }
    return { ok: true };
});

ipcMain.handle("window:minimize", function (event) {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
        win.minimize();
    }
    return { ok: true };
});

ipcMain.handle("window:restore", function (event) {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && !win.isDestroyed()) {
        if (win.isMinimized()) {
            win.restore();
        }
        win.show();
        win.focus();
    }
    return { ok: true };
});

ipcMain.handle("fs:writeText", function (_event, payload) {
    const relPath = payload && (payload.relPath || payload.path || payload.name);
    const content = payload && (payload.content !== undefined ? payload.content : payload.text);
    const ttlMs = payload && Number(payload.ttlMs || payload.ttl || 0);
    const persistent = Boolean(payload && payload.persistent);

    const resolved = resolveArtifactPath(String(relPath || ""));
    if (!resolved) {
        return { ok: false, error: "invalid_path" };
    }

    ensureDir(path.dirname(resolved.fullPath));
    fs.writeFileSync(resolved.fullPath, String(content || ""), "utf8");

    const manifest = loadManifest();
    const now = Date.now();
    const expiresAt = !persistent && ttlMs > 0 ? now + ttlMs : 0;
    manifest.files[resolved.relPath] = {
        relPath: resolved.relPath,
        updatedAt: now,
        createdAt: manifest.files[resolved.relPath]?.createdAt || now,
        ttlMs: ttlMs > 0 ? ttlMs : 0,
        expiresAt: expiresAt,
        persistent: persistent,
        size: String(content || "").length
    };
    saveManifest(manifest);

    return { ok: true, relPath: resolved.relPath };
});

ipcMain.handle("fs:readText", function (_event, payload) {
    const relPath = payload && (payload.relPath || payload.path || payload.name);
    const resolved = resolveArtifactPath(String(relPath || ""));
    if (!resolved) {
        return { ok: false, error: "invalid_path" };
    }
    if (!fs.existsSync(resolved.fullPath)) {
        return { ok: false, error: "not_found" };
    }
    const text = fs.readFileSync(resolved.fullPath, "utf8");
    return { ok: true, relPath: resolved.relPath, content: text };
});

ipcMain.handle("fs:delete", function (_event, payload) {
    const relPath = payload && (payload.relPath || payload.path || payload.name);
    const resolved = resolveArtifactPath(String(relPath || ""));
    if (!resolved) {
        return { ok: false, error: "invalid_path" };
    }
    try {
        if (fs.existsSync(resolved.fullPath)) {
            fs.unlinkSync(resolved.fullPath);
        }
    } catch (err) {
        return { ok: false, error: "delete_failed" };
    }
    const manifest = loadManifest();
    delete manifest.files[resolved.relPath];
    saveManifest(manifest);
    return { ok: true };
});

ipcMain.handle("fs:list", function () {
    const manifest = cleanupExpiredFiles();
    const files = manifest.files || {};
    const items = Object.keys(files).map(function (key) {
        return files[key];
    }).sort(function (a, b) {
        return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
    return { ok: true, items: items };
});

ipcMain.handle("fs:cleanup", function () {
    const manifest = cleanupExpiredFiles();
    return { ok: true, items: Object.values(manifest.files || {}) };
});

ipcMain.handle("fs:openFolder", function () {
    const root = getArtifactsRoot();
    ensureDir(root);
    shell.openPath(root);
    return { ok: true };
});

ipcMain.handle("cmd:systemInfo", function () {
    const home = os.homedir();
    const user = os.userInfo().username;
    return {
        user,
        home,
        homeDrive: path.parse(home).root,
        host: os.hostname(),
        release: os.release(),
        locale: typeof app.getLocale === "function" ? app.getLocale() : ""
    };
});

ipcMain.handle("terminal:open", async function (_event, payload) {
    const win = createCmdWindow();
    win.show();
    if (payload && payload.clear === true) {
        sendToCmd("cmd:clear");
    }
    if (payload && payload.title) {
        win.setTitle(String(payload.title));
    }
    if (payload && payload.title) {
        win.setTitle(String(payload.title));
    }
    let pathValue = payload && (payload.path || payload.prefix) ? String(payload.path || payload.prefix) : getDefaultCmdPath();
    if (payload && payload.choosePath) {
        try {
            const result = await dialog.showOpenDialog(win, {
                title: "Select folder",
                defaultPath: getDefaultCmdPath(),
                properties: ["openDirectory"]
            });
            if (result && !result.canceled && result.filePaths && result.filePaths[0]) {
                pathValue = result.filePaths[0];
            }
        } catch (err) {
            // ignore
        }
    }
    sendToCmd("cmd:open", { ...(payload || {}), path: pathValue, mode: "free" });
    return { ok: true };
});

ipcMain.handle("terminal:print", function (_event, payload) {
    const win = createCmdWindow();
    win.show();
    if (payload && payload.clear === true) {
        sendToCmd("cmd:clear");
    }
    const lines = Array.isArray(payload?.lines)
        ? payload.lines
        : (payload && payload.text !== undefined ? [payload.text] : []);
    lines.forEach(function (line) {
        const message = { text: String(line) };
        if (payload && payload.asCommand !== undefined) {
            message.asCommand = Boolean(payload.asCommand);
        }
        sendToCmd("cmd:print", message);
    });
    return { ok: true };
});

ipcMain.handle("terminal:type", function (_event, payload) {
    const win = createCmdWindow();
    win.show();
    if (payload && payload.clear === true) {
        sendToCmd("cmd:clear");
    }
    const text = payload && payload.text !== undefined ? String(payload.text) : "";
    const speedMs = payload && payload.speedMs !== undefined ? payload.speedMs : undefined;
    sendToCmd("cmd:type", { text, speedMs });
    return { ok: true };
});

ipcMain.handle("terminal:close", function () {
    if (cmdWindow && !cmdWindow.isDestroyed()) {
        cmdWindow.hide();
    }
    return { ok: true };
});

ipcMain.handle("terminal:choice", function (_event, payload) {
    const win = createCmdWindow();
    win.show();

    if (payload && payload.clear === true) {
        sendToCmd("cmd:clear");
    }

    if (pendingTerminalChoice) {
        pendingTerminalChoice({ key: null, canceled: true });
        pendingTerminalChoice = null;
    }

    const prompt = payload && payload.prompt ? String(payload.prompt) : "Select option";
    const keys = Array.isArray(payload?.keys) && payload.keys.length
        ? payload.keys.map(function (k) { return String(k).toUpperCase(); })
        : ["Y", "N"];

    const pathValue = payload && (payload.path || payload.prefix) ? String(payload.path || payload.prefix) : getDefaultCmdPath();
    sendToCmd("cmd:choice", {
        prompt,
        keys,
        path: pathValue
    });

    return new Promise(function (resolve) {
        pendingTerminalChoice = function (result) {
            resolve(result || { key: null, canceled: true });
        };
    });
});

ipcMain.on("terminal:choice", function (_event, key) {
    if (pendingTerminalChoice) {
        const result = { key: key ? String(key).toUpperCase() : null, canceled: false };
        pendingTerminalChoice(result);
        pendingTerminalChoice = null;
    }
});

ipcMain.on("terminal:input", function (_event, text) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("terminal:input", {
            text: text !== undefined ? String(text) : "",
            at: Date.now()
        });
    }
});

ipcMain.on("terminal:title", function (_event, title) {
    if (cmdWindow && !cmdWindow.isDestroyed()) {
        cmdWindow.setTitle(String(title || "C:\\Windows\\System32\\cmd.exe"));
    }
});

ipcMain.handle("window:fakeClose", function (_event, payload) {
    if (payload && payload.meta) {
        saveMeta({ ...loadMeta(), ...payload.meta });
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.close();
    }
    return { ok: true };
});

ipcMain.handle("terminal:title", function (_event, payload) {
    const win = createCmdWindow();
    win.show();
    const title = payload && payload.title !== undefined ? payload.title : payload;
    win.setTitle(String(title || "C:\\Windows\\System32\\cmd.exe"));
    return { ok: true };
});

ipcMain.handle("window:fakeRestart", function (_event, payload) {
    if (payload && payload.meta) {
        saveMeta({ ...loadMeta(), ...payload.meta });
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.reload();
    }
    return { ok: true };
});











app.on('will-quit', function () {
    globalShortcut.unregisterAll();
});



