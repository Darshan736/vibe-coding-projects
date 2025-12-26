const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { ipcMain } = require('electron');

let port;
let parser;

function initSerialHandlers(win) {
    // 1. List Ports
    ipcMain.handle('serial:list', async () => {
        try {
            const ports = await SerialPort.list();
            return ports;
        } catch (err) {
            console.error('Error listing ports:', err);
            return [];
        }
    });

    // 2. Connect to Port
    ipcMain.handle('serial:connect', async (event, path, baudRate = 9600) => {
        if (port && port.isOpen) {
            try {
                await new Promise((resolve) => port.close(() => resolve()));
            } catch (e) {
                console.error("Error closing existing port", e);
            }
        }

        return new Promise((resolve) => {
            try {
                port = new SerialPort({
                    path,
                    baudRate,
                    autoOpen: true,
                    // Try to prevent reset on some platforms/drivers
                    hupcl: false
                }, (err) => {
                    if (err) {
                        console.error('Error opening port:', err);
                        resolve({ success: false, error: err.message });
                    } else {
                        // After opening, we can try to set DTR to false to prevent reset on some boards
                        // but opening usually already triggered it.
                        port.set({ dtr: false, rts: false }, (err) => {
                            if (err) console.warn("Could not set DTR/RTS", err);
                        });
                        resolve({ success: true });
                    }
                });

                parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

                parser.on('data', (data) => {
                    // Send data to renderer
                    if (!win.isDestroyed()) {
                        win.webContents.send('serial:data', data);
                    }
                });

                port.on('close', () => {
                    if (!win.isDestroyed()) {
                        win.webContents.send('serial:closed');
                    }
                });

                port.on('error', (err) => {
                    if (!win.isDestroyed()) {
                        win.webContents.send('serial:error', err.message);
                    }
                });

            } catch (err) {
                resolve({ success: false, error: err.message });
            }
        });
    });

    // 3. Send Data to Port
    ipcMain.handle('serial:write', async (event, data) => {
        if (port && port.isOpen) {
            return new Promise((resolve) => {
                port.write(data + '\n', (err) => {
                    if (err) {
                        resolve({ success: false, error: err.message });
                    } else {
                        resolve({ success: true });
                    }
                });
            });
        }
        return { success: false, error: 'Port not open' };
    });

    // 4. Disconnect
    ipcMain.handle('serial:disconnect', async () => {
        if (port && port.isOpen) {
            return new Promise((resolve) => {
                port.close((err) => {
                    if (err) {
                        resolve({ success: false, error: err.message });
                    } else {
                        resolve({ success: true });
                    }
                });
            });
        }
        return { success: true };
    });
}

module.exports = { initSerialHandlers };

