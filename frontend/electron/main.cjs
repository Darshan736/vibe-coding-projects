const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const { initSerialHandlers } = require('./serial.cjs');

let backendProcess = null;

function startBackend() {
    if (app.isPackaged) {
        // In production, spawn the compiled backend executable
        // We will place the backend executable in resources/backend/
        const backendPath = path.join(process.resourcesPath, 'backend', 'backend.exe'); // Windows
        // For Linux usually just 'backend'
        const executable = process.platform === 'win32' ? 'backend.exe' : 'backend';
        const finalPath = path.join(process.resourcesPath, 'backend', executable);

        console.log('Launching backend from:', finalPath);

        backendProcess = spawn(finalPath, [], {
            cwd: path.dirname(finalPath)
        });

        backendProcess.stdout.on('data', (data) => {
            console.log(`[Backend]: ${data}`);
        });

        backendProcess.stderr.on('data', (data) => {
            console.error(`[Backend Err]: ${data}`);
        });
    } else {
        // In dev, we assume start_dev.bat launched it, OR we could launch it here.
        // For now, let's just log.
        console.log('Development mode: Backend should be running externally.');
    }
}

function stopBackend() {
    if (backendProcess) {
        console.log('Stopping backend...');
        backendProcess.kill();
        backendProcess = null;
    }
}



function setupMenu(win) {
    const isMac = process.platform === 'darwin';

    const template = [
        // { role: 'appMenu' }
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        }] : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [
                {
                    label: 'New File',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => win.webContents.send('menu:action', 'new-file')
                },
                {
                    label: 'New Folder',
                    accelerator: 'CmdOrCtrl+Shift+N',
                    click: () => win.webContents.send('menu:action', 'new-folder')
                },
                { type: 'separator' },
                {
                    label: 'Open Folder',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => win.webContents.send('menu:action', 'open-folder')
                },
                { type: 'separator' },
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => win.webContents.send('menu:action', 'save')
                },
                { type: 'separator' },
                isMac ? { role: 'close' } : { role: 'quit' }
            ]
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                ...(isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                    { type: 'separator' },
                    {
                        label: 'Speech',
                        submenu: [
                            { role: 'startSpeaking' },
                            { role: 'stopSpeaking' }
                        ]
                    }
                ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ])
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                ...(isMac ? [
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    { role: 'window' }
                ] : [
                    { role: 'close' }
                ])
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        const { shell } = require('electron');
                        await shell.openExternal('https://electronjs.org');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}


function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
        // Use dark theme frame for cleaner look
        backgroundColor: '#0b0f14',
        icon: path.join(__dirname, '../public/favicon.ico')
    });

    // In development, load from Vite dev server
    if (process.env.ELECTRON_START_URL) {
        win.loadURL(process.env.ELECTRON_START_URL);
    } else {
        // In production, load the local index.html
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Setup Application Menu
    setupMenu(win);

    // Launch Backend Process
    startBackend();

    // Initialize Serial Handlers
    initSerialHandlers(win);

    // File System Handlers
    const { ipcMain, dialog } = require('electron');
    const fs = require('fs');

    ipcMain.handle('fs:open-folder', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog(win, {
            properties: ['openDirectory']
        });
        if (canceled) return null;

        const dirPath = filePaths[0];
        try {
            const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
            const fileList = files.map(file => ({
                name: file.name,
                isDirectory: file.isDirectory(),
                path: path.join(dirPath, file.name)
            }));
            // Sort: directories first
            fileList.sort((a, b) => (a.isDirectory === b.isDirectory ? 0 : a.isDirectory ? -1 : 1));
            return { path: dirPath, files: fileList };
        } catch (err) {
            console.error(err);
            return null;
        }
    });

    ipcMain.handle('fs:read-file', async (event, filePath) => {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return content;
        } catch (err) {
            return null;
        }
    });

    ipcMain.handle('fs:save-file', async (event, filePath, content) => {
        try {
            await fs.promises.writeFile(filePath, content, 'utf-8');
            return true;
        } catch (err) {
            return false;
        }
    });

    ipcMain.handle('fs:create-file', async (event, folderPath, fileName) => {
        try {
            const filePath = path.join(folderPath, fileName);
            // Don't overwrite existing
            if (fs.existsSync(filePath)) return { success: false, error: 'File already exists' };

            await fs.promises.writeFile(filePath, '', 'utf-8');
            return { success: true, path: filePath };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });

    ipcMain.handle('fs:create-folder', async (event, folderPath, folderName) => {
        try {
            const dirPath = path.join(folderPath, folderName);
            console.log(`Creating folder at: ${dirPath}`); // Debug log

            if (fs.existsSync(dirPath)) {
                console.log('Folder already exists');
                return { success: false, error: 'Folder already exists' };
            }

            await fs.promises.mkdir(dirPath, { recursive: true });
            console.log('Folder created successfully');
            return { success: true, path: dirPath };
        } catch (err) {
            console.error('Error creating folder:', err);
            return { success: false, error: err.message };
        }
    });

    ipcMain.handle('fs:read-folder', async (event, dirPath) => {
        try {
            const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
            const fileList = files.map(file => ({
                name: file.name,
                isDirectory: file.isDirectory(),
                path: path.join(dirPath, file.name)
            }));
            fileList.sort((a, b) => (a.isDirectory === b.isDirectory ? 0 : a.isDirectory ? -1 : 1));
            return { success: true, files: fileList };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });

    // Open DevTools in dev mode
    win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    stopBackend();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
