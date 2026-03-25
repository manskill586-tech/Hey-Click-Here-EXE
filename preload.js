const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("system", {
    isElectron: true,
    fs: {
        writeText: (payload) => ipcRenderer.invoke("fs:writeText", payload),
        readText: (payload) => ipcRenderer.invoke("fs:readText", payload),
        delete: (payload) => ipcRenderer.invoke("fs:delete", payload),
        list: () => ipcRenderer.invoke("fs:list"),
        cleanup: () => ipcRenderer.invoke("fs:cleanup"),
        openFolder: () => ipcRenderer.invoke("fs:openFolder")
    },
    project: {
        writeText: (payload) => ipcRenderer.invoke('project:writeText', payload),
        readText: (payload) => ipcRenderer.invoke('project:readText', payload),
        deleteText: (payload) => ipcRenderer.invoke('project:delete', payload)
    },
    terminal: {
        open: (payload) => ipcRenderer.invoke("terminal:open", payload),
        print: (payload) => ipcRenderer.invoke("terminal:print", payload),
        type: (payload) => ipcRenderer.invoke("terminal:type", payload),
        choice: (payload) => ipcRenderer.invoke("terminal:choice", payload),
        close: () => ipcRenderer.invoke("terminal:close"),
        title: (payload) => ipcRenderer.invoke("terminal:title", payload)
    },
    meta: {
        get: () => ipcRenderer.invoke("meta:get"),
        set: (payload) => ipcRenderer.invoke("meta:set", payload)
    },
    user: {
        getProfile: () => ipcRenderer.invoke("user:getProfile")
    },
    window: {
        fakeClose: (payload) => ipcRenderer.invoke("window:fakeClose", payload),
        fakeRestart: (payload) => ipcRenderer.invoke("window:fakeRestart", payload),
        minimize: () => ipcRenderer.invoke('window:minimize'),
        restore: () => ipcRenderer.invoke('window:restore')
    }
});



