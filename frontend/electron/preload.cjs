const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        let validChannels = ['toMain'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ['fromMain'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    // Serial Port API
    serial: {
        list: () => ipcRenderer.invoke('serial:list'),
        connect: (path, baudRate) => ipcRenderer.invoke('serial:connect', path, baudRate),
        disconnect: () => ipcRenderer.invoke('serial:disconnect'),
        write: (data) => ipcRenderer.invoke('serial:write', data),
        onData: (callback) => {
            const subscription = (event, data) => callback(data);
            ipcRenderer.on('serial:data', subscription);
            return () => ipcRenderer.removeListener('serial:data', subscription);
        },
        onClosed: (callback) => {
            const subscription = () => callback();
            ipcRenderer.on('serial:closed', subscription);
            return () => ipcRenderer.removeListener('serial:closed', subscription);
        },
        onError: (callback) => {
            const subscription = (event, err) => callback(err);
            ipcRenderer.on('serial:error', subscription);
            return () => ipcRenderer.removeListener('serial:error', subscription);
        }
    },
    // File System API
    fs: {
        openFolder: () => ipcRenderer.invoke('fs:open-folder'),
        readFile: (path) => ipcRenderer.invoke('fs:read-file', path),
        saveFile: (path, content) => ipcRenderer.invoke('fs:save-file', path, content),
        createFile: (folderPath, fileName) => ipcRenderer.invoke('fs:create-file', folderPath, fileName),
        createFolder: (folderPath, folderName) => ipcRenderer.invoke('fs:create-folder', folderPath, folderName),
        readFolder: (path) => ipcRenderer.invoke('fs:read-folder', path)
    },
    // Menu Events
    onMenuAction: (callback) => {
        const subscription = (event, action) => callback(action);
        ipcRenderer.on('menu:action', subscription);
        return () => ipcRenderer.removeListener('menu:action', subscription);
    }
});
