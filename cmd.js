const output = document.getElementById("output");
let promptLine = null;
let promptPrefix = null;
let promptBefore = null;
let promptAfter = null;
const promptInput = document.getElementById("promptInput");
const promptHint = document.getElementById("promptHint");
const bannerEl = document.createElement("div");
const linesEl = document.createElement("div");
bannerEl.className = "banner";
linesEl.className = "lines";
if (output) {
    if (promptHint && promptHint.parentElement === output) {
        output.removeChild(promptHint);
    }
    output.innerHTML = "";
    output.appendChild(bannerEl);
    output.appendChild(linesEl);
    if (promptHint) {
        output.appendChild(promptHint);
    }
}
let typingQueue = [];
let typingTimer = null;

let allowedKeys = [];
let buffer = "";
let autoSubmit = false;
let cursorIndex = 0;
let inputMode = "free";
const history = [];
let historyIndex = -1;
let cwd = "C:\\Users\\RBIT";
let bannerPrinted = false;
let systemInfo = {
    user: "RBIT",
    home: "C:\\Users\\RBIT",
    homeDrive: "C:\\",
    host: "PC",
    release: "10.0.19045.4717",
    locale: ""
};
let systemInfoReady = false;
let pendingShowPrompt = null;

let VFS = {
    "C:\\": { dirs: ["Users", "Windows", "Program Files"], files: [] },
    "C:\\Users": { dirs: ["RBIT", "Public"], files: [] },
    "C:\\Users\\RBIT": { dirs: ["Desktop", "Documents", "Downloads", "Flavortown"], files: ["readme.txt"] },
    "C:\\Users\\RBIT\\Desktop": { dirs: [], files: ["note.txt"] },
    "C:\\Users\\RBIT\\Documents": { dirs: [], files: ["recipe.txt"] },
    "C:\\Users\\RBIT\\Downloads": { dirs: [], files: [] },
    "C:\\Users\\RBIT\\Flavortown": { dirs: ["notes"], files: ["manifest.json"] },
    "C:\\Users\\RBIT\\Flavortown\\notes": { dirs: [], files: ["hello.txt"] }
};

let FILES = {
    "C:\\Users\\RBIT\\readme.txt": "Welcome.\r\nType HELP for commands.",
    "C:\\Users\\RBIT\\Desktop\\note.txt": "Don't forget the morning stand.",
    "C:\\Users\\RBIT\\Documents\\recipe.txt": "Simple stew: onions, carrots, time.",
    "C:\\Users\\RBIT\\Flavortown\\manifest.json": "{\"version\":1,\"files\":{}}",
    "C:\\Users\\RBIT\\Flavortown\\notes\\hello.txt": "Artifact test."
};

function normalizePath(input) {
    if (!input) {
        return cwd;
    }
    let path = String(input).replace(/\//g, "\\");
    const hasDrive = /^[a-zA-Z]:/.test(path);
    if (!hasDrive) {
        if (path.startsWith("\\")) {
            path = "C:\\" + path.slice(1);
        } else {
            const base = cwd.endsWith("\\") ? cwd : cwd + "\\";
            path = base + path;
        }
    }
    const drive = path.slice(0, 2).toUpperCase();
    const rest = path.slice(2).replace(/^\\+/, "");
    const parts = rest ? rest.split("\\") : [];
    const stack = [];
    parts.forEach((part) => {
        if (!part || part === ".") {
            return;
        }
        if (part === "..") {
            stack.pop();
            return;
        }
        stack.push(part);
    });
    return drive + "\\" + stack.join("\\");
}

function pathExists(target) {
    return Boolean(VFS[target]);
}

function setCwd(target, force) {
    const normalized = normalizePath(target);
    if (pathExists(normalized)) {
        cwd = normalized;
        return true;
    }
    if (force) {
        if (!VFS[normalized]) {
            VFS[normalized] = { dirs: [], files: [] };
        }
        cwd = normalized;
        return true;
    }
    return false;
}

function getPromptPrefix() {
    return cwd + ">";
}

function formatDateTime(date) {
    const pad = (num) => String(num).padStart(2, "0");
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const year = date.getFullYear();
    let hour = date.getHours();
    const minute = pad(date.getMinutes());
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return {
        date: `${month}/${day}/${year}`,
        time: `${pad(hour)}:${minute} ${ampm}`
    };
}

function getSystemLocale() {
    if (navigator.languages && navigator.languages.length) {
        return String(navigator.languages[0]).toLowerCase();
    }
    return String(navigator.language || "en").toLowerCase();
}

function normalizeWinPath(value) {
    return String(value || "").replace(/\//g, "\\").replace(/[\\]+$/, "");
}

function getHomeDrive(info) {
    if (info && info.homeDrive) {
        const drive = normalizeWinPath(info.homeDrive);
        return drive.endsWith("\\") ? drive : drive + "\\";
    }
    const home = normalizeWinPath(info && info.home);
    if (/^[a-zA-Z]:\\/.test(home)) {
        return home.slice(0, 3);
    }
    return "C:\\";
}

function buildVfs(info) {
    const drive = getHomeDrive(info);
    const user = (info && info.user) || "Player";
    const home = normalizeWinPath((info && info.home) || (drive + "Users\\" + user));
    const usersRoot = drive + "Users";
    const flavortown = home + "\\Flavortown";
    return {
        [drive]: { dirs: ["Users", "Windows", "Program Files"], files: [] },
        [usersRoot]: { dirs: [user, "Public"], files: [] },
        [home]: { dirs: ["Desktop", "Documents", "Downloads", "Flavortown"], files: ["readme.txt"] },
        [home + "\\Desktop"]: { dirs: [], files: ["note.txt"] },
        [home + "\\Documents"]: { dirs: [], files: ["recipe.txt"] },
        [home + "\\Downloads"]: { dirs: [], files: [] },
        [flavortown]: { dirs: ["notes"], files: ["manifest.json"] },
        [flavortown + "\\notes"]: { dirs: [], files: ["hello.txt"] }
    };
}

function buildFiles(info) {
    const drive = getHomeDrive(info);
    const user = (info && info.user) || "Player";
    const home = normalizeWinPath((info && info.home) || (drive + "Users\\" + user));
    const flavortown = home + "\\Flavortown";
    return {
        [home + "\\readme.txt"]: "Welcome.\r\nType HELP for commands.",
        [home + "\\Desktop\\note.txt"]: "Don't forget the morning stand.",
        [home + "\\Documents\\recipe.txt"]: "Simple stew: onions, carrots, time.",
        [flavortown + "\\manifest.json"]: "{\"version\":1,\"files\":{}}",
        [flavortown + "\\notes\\hello.txt"]: "Artifact test."
    };
}

function applySystemInfo(info) {
    if (info && typeof info === "object") {
        systemInfo = { ...systemInfo, ...info };
    }
    if (!systemInfo.locale) {
        systemInfo.locale = getSystemLocale();
    }
    VFS = buildVfs(systemInfo);
    FILES = buildFiles(systemInfo);
    const desired = normalizeWinPath(systemInfo.home);
    if (desired && VFS[desired]) {
        cwd = desired;
    }
}

applySystemInfo(systemInfo);

function getActiveLocale() {
    return (systemInfo && systemInfo.locale) ? String(systemInfo.locale).toLowerCase() : getSystemLocale();
}

function getBannerLines() {
    const locale = getActiveLocale();
    const version = systemInfo && systemInfo.release ? String(systemInfo.release) : "10.0.19045.4717";
    if (locale.startsWith("ru")) {
        return [
            `Microsoft Windows [Version ${version}]`,
            "(c) Корпорация Майкрософт (Microsoft Corporation). Все права защищены."
        ];
    }
    return [
        `Microsoft Windows [Version ${version}]`,
        "(c) Microsoft Corporation. All rights reserved."
    ];
}

function printBannerOnce() {
    if (bannerPrinted) {
        return;
    }
    bannerPrinted = true;
    getBannerLines().forEach((line) => appendBannerLine(line));
    appendBannerLine("");
}

function appendBannerLine(text) {
    const line = document.createElement("div");
    line.className = "line";
    line.textContent = text;
    bannerEl.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function clearOutputLines() {
    if (linesEl) {
        linesEl.innerHTML = "";
    }
    typingQueue = [];
    if (typingTimer) {
        clearInterval(typingTimer);
        typingTimer = null;
    }
    if (promptHint && promptHint.parentElement !== output) {
        output.appendChild(promptHint);
    }
    if (promptLine && promptLine.parentElement !== output) {
        output.insertBefore(promptLine, promptHint || null);
    }
}

function printDir(target) {
    const dirPath = normalizePath(target || cwd);
    if (!pathExists(dirPath)) {
        appendLine("The system cannot find the path specified.");
        return;
    }
    const listing = VFS[dirPath];
    const now = formatDateTime(new Date());
    appendLine(" Volume in drive C has no label.");
    appendLine(" Volume Serial Number is 3A2F-1B7C");
    appendLine("");
    appendLine(" Directory of " + dirPath);
    appendLine("");
    listing.dirs.forEach((name) => {
        appendLine(`${now.date}  ${now.time}    <DIR>          ${name}`);
    });
    listing.files.forEach((name) => {
        appendLine(`${now.date}  ${now.time}             1,024 ${name}`);
    });
    appendLine(`               ${listing.files.length} File(s)          ${listing.files.length * 1024} bytes`);
    appendLine(`               ${listing.dirs.length} Dir(s)  123,456,789,000 bytes free`);
}

function splitArgs(input) {
    const args = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < input.length; i += 1) {
        const ch = input[i];
        if (ch === "\"") {
            inQuotes = !inQuotes;
            continue;
        }
        if (!inQuotes && /\s/.test(ch)) {
            if (current) {
                args.push(current);
                current = "";
            }
            continue;
        }
        current += ch;
    }
    if (current) {
        args.push(current);
    }
    return args;
}

function createPromptLine() {
    const line = document.createElement("div");
    line.className = "prompt-line line";
    const prefixEl = document.createElement("span");
    prefixEl.className = "prompt-prefix";
    const beforeEl = document.createElement("span");
    beforeEl.className = "prompt-before";
    const caretEl = document.createElement("span");
    caretEl.className = "caret";
    const afterEl = document.createElement("span");
    afterEl.className = "prompt-after";
    line.appendChild(prefixEl);
    line.appendChild(document.createTextNode(" "));
    line.appendChild(beforeEl);
    line.appendChild(caretEl);
    line.appendChild(afterEl);

    if (promptHint && promptHint.parentElement === output) {
        output.insertBefore(line, promptHint);
    } else {
        output.appendChild(line);
    }
    promptLine = line;
    promptPrefix = prefixEl;
    promptBefore = beforeEl;
    promptAfter = afterEl;
}

function ensurePromptLine() {
    if (!promptLine) {
        createPromptLine();
        return;
    }
    if (promptLine.parentElement !== output) {
        if (promptHint && promptHint.parentElement === output) {
            output.insertBefore(promptLine, promptHint);
        } else {
            output.appendChild(promptLine);
        }
    }
}

function finalizePromptLine(text) {
    if (!promptLine) {
        appendLine(text);
        return;
    }
    const line = document.createElement("div");
    line.className = "line";
    line.textContent = text;
    if (linesEl) {
        linesEl.appendChild(line);
    } else {
        output.replaceChild(line, promptLine);
    }
    if (promptLine.parentElement) {
        promptLine.parentElement.removeChild(promptLine);
    }
    promptLine = null;
    promptPrefix = null;
    promptBefore = null;
    promptAfter = null;
}

function appendLine(text) {
    const line = document.createElement("div");
    line.className = "line";
    line.textContent = text;
    insertLineElement(line);
    output.scrollTop = output.scrollHeight;
}

function appendCommandLine(text) {
    const lineText = getPromptPrefix() + " " + text;
    if (promptLine) {
        finalizePromptLine(lineText);
    } else {
        appendLine(lineText);
    }
    showPrompt({ mode: "free" });
}

function insertLineElement(line) {
    if (linesEl) {
        linesEl.appendChild(line);
        return;
    }
    if (promptLine && promptLine.parentElement === output) {
        output.insertBefore(line, promptLine);
        return;
    }
    if (promptHint && promptHint.parentElement === output) {
        output.insertBefore(line, promptHint);
        return;
    }
    output.appendChild(line);
}

function queueTypeLine(payload) {
    const text = payload && payload.text !== undefined ? String(payload.text) : "";
    let speed = payload && payload.speedMs !== undefined ? Number(payload.speedMs) : NaN;
    if (!Number.isFinite(speed)) {
        speed = 25;
    }
    speed = Math.max(5, Math.min(200, speed));
    const lines = text.split(/\r?\n/);
    const useCommandLine = payload && payload.asCommand !== undefined ? Boolean(payload.asCommand) : true;
    lines.forEach((line) => typingQueue.push({ text: line, speed, command: useCommandLine }));
    processTypeQueue();
}

function processTypeQueue() {
    if (typingTimer || !typingQueue.length) {
        return;
    }
    const next = typingQueue.shift();
    const lineEl = document.createElement("div");
    lineEl.className = "line";
    const prefix = next.command ? (getPromptPrefix() + " ") : "";
    lineEl.textContent = prefix;
    insertLineElement(lineEl);
    let index = 0;
    const text = next.text || "";
    if (!text.length) {
        output.scrollTop = output.scrollHeight;
        if (next.command) {
            showPrompt({ mode: "free" });
        }
        processTypeQueue();
        return;
    }
    typingTimer = setInterval(() => {
        index += 1;
        lineEl.textContent = prefix + text.slice(0, index);
        output.scrollTop = output.scrollHeight;
        if (index >= text.length) {
            clearInterval(typingTimer);
            typingTimer = null;
            if (next.command) {
                showPrompt({ mode: "free" });
            }
            processTypeQueue();
        }
    }, next.speed);
}

function updateBufferDisplay() {
    if (promptBefore && promptAfter) {
        const before = buffer.slice(0, cursorIndex);
        const after = buffer.slice(cursorIndex);
        promptBefore.textContent = before;
        promptAfter.textContent = after;
    }
    output.scrollTop = output.scrollHeight;
}

function showPrompt(config) {
    if (!systemInfoReady) {
        pendingShowPrompt = config;
        return;
    }
    if (!bannerPrinted) {
        printBannerOnce();
    }
    const hasKeys = Array.isArray(config?.keys) && config.keys.length;
    inputMode = config?.mode ? String(config.mode).toLowerCase() : (hasKeys ? "choice" : "free");
    const keys = hasKeys ? config.keys : ["Y", "N"];
    allowedKeys = inputMode === "choice" ? keys.map((k) => String(k).toUpperCase()) : [];
    autoSubmit = Boolean(config && config.autoSubmit && inputMode === "choice");

    if (config && config.prompt) {
        appendLine(String(config.prompt));
    }

    if (config && (config.path || config.prefix)) {
        const desired = String(config.path || config.prefix).replace(/>$/, "");
        setCwd(desired, true);
    }
    if (promptHint && promptHint.parentElement !== output) {
        output.appendChild(promptHint);
    }
    ensurePromptLine();
    if (promptPrefix) {
        promptPrefix.textContent = getPromptPrefix();
    }
    buffer = "";
    cursorIndex = 0;
    historyIndex = history.length;
    updateBufferDisplay();

    if (promptHint) {
        if (config && config.hint) {
            promptHint.textContent = config.hint;
            promptHint.hidden = false;
        } else {
            promptHint.textContent = "";
            promptHint.hidden = true;
        }
    }

    promptInput.value = "";
    promptInput.focus();
}

function hidePrompt() {
    if (promptLine) {
        if (promptLine.parentElement) {
            promptLine.parentElement.removeChild(promptLine);
        }
        promptLine = null;
        promptPrefix = null;
        promptBefore = null;
        promptAfter = null;
    }
    allowedKeys = [];
    buffer = "";
    cursorIndex = 0;
    updateBufferDisplay();
    autoSubmit = false;
    if (promptHint) {
        promptHint.hidden = true;
    }
}

function acceptBuffer() {
    const trimmed = buffer.trim();
    const promptText = getPromptPrefix() + " " + buffer;

    if (inputMode === "choice") {
        if (!allowedKeys.length) {
            return;
        }
        const key = trimmed ? trimmed[0].toUpperCase() : "";
        if (!allowedKeys.includes(key)) {
            appendLine("The system cannot accept that input.");
            buffer = "";
            cursorIndex = 0;
            updateBufferDisplay();
            return;
        }
        finalizePromptLine(promptText);
        hidePrompt();
        window.cmdBridge.sendChoice(key);
        return;
    }

    finalizePromptLine(promptText);
    if (trimmed) {
        history.push(buffer);
        historyIndex = history.length;
        const parts = splitArgs(trimmed);
        const cmd = parts.shift().toLowerCase();
        const argLine = parts.join(" ");

        if (cmd === "cls") {
            clearOutputLines();
            buffer = "";
            cursorIndex = 0;
            showPrompt({ mode: "free" });
            return;
        } else if (cmd === "help") {
            appendLine("Supported commands: CLS, HELP, DIR, CD, ECHO, TYPE, EXIT, TITLE, DATE, TIME, VER, COLOR");
        } else if (cmd === "dir") {
            printDir(parts[0] || "");
        } else if (cmd === "cd") {
            if (!parts.length) {
                appendLine(cwd);
            } else if (parts[0] === "\\" || parts[0] === "/") {
                setCwd("C:\\");
            } else if (parts[0].toLowerCase() === "..") {
                setCwd(normalizePath(".."));
            } else {
                const ok = setCwd(parts[0]);
                if (!ok) {
                    appendLine("The system cannot find the path specified.");
                }
            }
            if (promptPrefix) {
                promptPrefix.textContent = getPromptPrefix();
            }
        } else if (cmd === "echo") {
            if (!argLine) {
                appendLine("ECHO is on.");
            } else {
                appendLine(argLine);
            }
        } else if (cmd === "type") {
            const target = normalizePath(parts[0] || "");
            if (FILES[target]) {
                FILES[target].split(/\r?\n/).forEach((line) => appendLine(line));
            } else {
                appendLine("The system cannot find the file specified.");
            }
        } else if (cmd === "exit") {
            window.close();
            return;
        } else if (cmd === "title") {
            const title = argLine || "C:\\Windows\\System32\\cmd.exe";
            document.title = title;
            if (window.cmdBridge && typeof window.cmdBridge.setTitle === "function") {
                window.cmdBridge.setTitle(title);
            }
        } else if (cmd === "date") {
            const now = formatDateTime(new Date());
            appendLine("The current date is: " + now.date);
        } else if (cmd === "time") {
            const now = formatDateTime(new Date());
            appendLine("The current time is: " + now.time);
        } else if (cmd === "ver") {
            const version = systemInfo && systemInfo.release ? String(systemInfo.release) : "10.0.19045.4717";
            appendLine(`Microsoft Windows [Version ${version}]`);
        } else if (cmd === "color") {
            const colorArg = (parts[0] || "").trim();
            if (!/^[0-9a-fA-F]{2}$/.test(colorArg)) {
                appendLine("Invalid color.");
            } else {
                const map = {
                    "0": "#000000",
                    "1": "#0c1a4b",
                    "2": "#0b3d0b",
                    "3": "#0b3d3d",
                    "4": "#3d0b0b",
                    "5": "#3d0b3d",
                    "6": "#3d2f0b",
                    "7": "#c0c0c0",
                    "8": "#404040",
                    "9": "#4f7cff",
                    "a": "#55ff55",
                    "b": "#55ffff",
                    "c": "#ff5555",
                    "d": "#ff55ff",
                    "e": "#ffff55",
                    "f": "#ffffff"
                };
                const bg = map[colorArg[0].toLowerCase()];
                const fg = map[colorArg[1].toLowerCase()];
                if (bg && fg) {
                    document.documentElement.style.setProperty("--crt-bg", bg);
                    document.documentElement.style.setProperty("--crt-fg", fg);
                }
            }
        } else {
            appendLine("'" + trimmed + "' is not recognized as an internal or external command,");
            appendLine("operable program or batch file.");
        }
    }
    if (window.cmdBridge && typeof window.cmdBridge.sendInput === "function") {
        window.cmdBridge.sendInput(buffer);
    }
    buffer = "";
    cursorIndex = 0;
    updateBufferDisplay();
    showPrompt({ mode: "free" });
}

function handleKeyDown(event) {
    if (!promptLine) {
        return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "l") {
        clearOutputLines();
        if (!promptLine) {
            ensurePromptLine();
        }
        event.preventDefault();
        return;
    }
    if (event.ctrlKey && event.key.toLowerCase() === "u") {
        buffer = "";
        cursorIndex = 0;
        updateBufferDisplay();
        event.preventDefault();
        return;
    }

    if (event.key === "Backspace") {
        if (cursorIndex > 0) {
            buffer = buffer.slice(0, cursorIndex - 1) + buffer.slice(cursorIndex);
            cursorIndex -= 1;
        }
        updateBufferDisplay();
        event.preventDefault();
        return;
    }

    if (event.key === "Delete") {
        if (cursorIndex < buffer.length) {
            buffer = buffer.slice(0, cursorIndex) + buffer.slice(cursorIndex + 1);
        }
        updateBufferDisplay();
        event.preventDefault();
        return;
    }

    if (event.key === "ArrowLeft") {
        cursorIndex = Math.max(0, cursorIndex - 1);
        updateBufferDisplay();
        event.preventDefault();
        return;
    }

    if (event.key === "ArrowRight") {
        cursorIndex = Math.min(buffer.length, cursorIndex + 1);
        updateBufferDisplay();
        event.preventDefault();
        return;
    }

    if (event.key === "Home") {
        cursorIndex = 0;
        updateBufferDisplay();
        event.preventDefault();
        return;
    }

    if (event.key === "End") {
        cursorIndex = buffer.length;
        updateBufferDisplay();
        event.preventDefault();
        return;
    }

    if ((event.key === "ArrowUp" || event.key === "ArrowDown") && inputMode === "free") {
        if (!history.length) {
            event.preventDefault();
            return;
        }
        if (event.key === "ArrowUp") {
            historyIndex = Math.max(0, historyIndex - 1);
        } else {
            historyIndex = Math.min(history.length, historyIndex + 1);
        }
        buffer = historyIndex >= history.length ? "" : history[historyIndex];
        cursorIndex = buffer.length;
        updateBufferDisplay();
        event.preventDefault();
        return;
    }

    if (event.key === "Enter") {
        acceptBuffer();
        event.preventDefault();
        return;
    }

    if (event.key.length === 1) {
        buffer = buffer.slice(0, cursorIndex) + event.key + buffer.slice(cursorIndex);
        cursorIndex += 1;
        updateBufferDisplay();
        if (autoSubmit) {
            const key = buffer.trim().toUpperCase();
            if (key && allowedKeys.includes(key[0])) {
                acceptBuffer();
            }
        }
        event.preventDefault();
    }
}

function initSystemInfo() {
    if (!window.cmdBridge || typeof window.cmdBridge.getSystemInfo !== "function") {
        systemInfoReady = true;
        const pending = pendingShowPrompt;
        pendingShowPrompt = null;
        if (pending) {
            showPrompt(pending);
        }
        return;
    }

    window.cmdBridge.getSystemInfo().then((info) => {
        applySystemInfo(info);
        systemInfoReady = true;
        const pending = pendingShowPrompt;
        pendingShowPrompt = null;
        if (pending) {
            showPrompt(pending);
        }
    }).catch(() => {
        systemInfoReady = true;
        const pending = pendingShowPrompt;
        pendingShowPrompt = null;
        if (pending) {
            showPrompt(pending);
        }
    });
}

window.cmdBridge.onPrint(function (line) {
    if (!bannerPrinted) {
        printBannerOnce();
    }
    if (!promptLine) {
        ensurePromptLine();
    }
    if (line && typeof line === "object") {
        const text = line.text !== undefined ? String(line.text) : "";
        const asCommand = line.asCommand !== undefined ? Boolean(line.asCommand) : true;
        if (asCommand) {
            appendCommandLine(text);
        } else {
            appendLine(text);
        }
        return;
    }
    appendLine(String(line));
});

window.cmdBridge.onClear(function () {
    clearOutputLines();
});

window.cmdBridge.onChoice(function (payload) {
    showPrompt({ ...(payload || {}), mode: "choice" });
});

if (window.cmdBridge && typeof window.cmdBridge.onType === "function") {
    window.cmdBridge.onType(function (payload) {
        if (!bannerPrinted) {
            printBannerOnce();
        }
        if (!promptLine) {
            ensurePromptLine();
        }
        queueTypeLine(payload || {});
    });
}

if (window.cmdBridge && typeof window.cmdBridge.onOpen === "function") {
    window.cmdBridge.onOpen(function (payload) {
        showPrompt({ ...(payload || {}), mode: "free" });
    });
}

document.addEventListener("keydown", handleKeyDown);
let mouseDown = false;
let selecting = false;
document.addEventListener("mousedown", function (event) {
    if (event.button !== 0) {
        return;
    }
    mouseDown = true;
    selecting = false;
});

document.addEventListener("mousemove", function () {
    if (mouseDown) {
        selecting = true;
    }
});

document.addEventListener("mouseup", function (event) {
    if (event.button !== 0) {
        return;
    }
    if (!selecting && promptLine) {
        promptInput.focus();
    }
    mouseDown = false;
    selecting = false;
});

initSystemInfo();

if (!window.cmdBridge) {
    showPrompt({ mode: "free" });
}
