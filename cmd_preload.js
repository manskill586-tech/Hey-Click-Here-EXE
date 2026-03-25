const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cmdBridge", {
    onPrint: (callback) => ipcRenderer.on("cmd:print", (_event, line) => callback(line)),
    onClear: (callback) => ipcRenderer.on("cmd:clear", () => callback()),
    onType: (callback) => ipcRenderer.on("cmd:type", (_event, payload) => callback(payload)),
    onChoice: (callback) => ipcRenderer.on("cmd:choice", (_event, payload) => callback(payload)),
    onOpen: (callback) => ipcRenderer.on("cmd:open", (_event, payload) => callback(payload)),
    sendChoice: (key) => ipcRenderer.send("terminal:choice", key),
    sendInput: (text) => ipcRenderer.send("terminal:input", text),
    setTitle: (title) => ipcRenderer.send("terminal:title", title),
    getSystemInfo: () => ipcRenderer.invoke("cmd:systemInfo")
});
