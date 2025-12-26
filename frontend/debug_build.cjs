const builder = require('electron-builder');
const Platform = builder.Platform;

builder.build({
    targets: Platform.WINDOWS.createTarget(),
    config: {
        "appId": "com.aireduino.ide",
        "productName": "AI Arduino IDE",
        "directories": {
            "output": "dist_app"
        },
        "files": [
            "dist/**/*",
            "electron/**/*",
            "package.json"
        ],
        "extraResources": [
            {
                "from": "../backend/dist/backend.exe",
                "to": "backend/backend.exe"
            }
        ],
        "win": {
            "target": ["dir"]
        }
    }
})
    .then(() => {
        console.log("Build OK!");
    })
    .catch((error) => {
        console.error("Build Failed:");
        console.error(error);
    });
