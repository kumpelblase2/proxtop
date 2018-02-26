import windowManager from "./window_manager";

const { Menu } = require('electron');

function isOSX(platform) {
    return platform === 'darwin';
}

export default function createMenu(proxtop) {
    return Menu.buildFromTemplate([
        {
            label: 'Proxtop',
            submenu: [
                {
                    label: 'About',
                    role: 'about',
                    click: function() {
                        windowManager.createAboutWindow();
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: (function() {
                        if (isOSX(process.platform)) {
                            return 'Alt+Command+I';
                        } else {
                            return 'Ctrl+Shift+I';
                        }
                    })(),
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.toggleDevTools();
                        }
                    }
                },
                {
                    label: 'Reload',
                    accelerator: (function() {
                        if (isOSX(process.platform)) {
                            return 'Command+R';
                        } else {
                            return 'Ctrl+R';
                        }
                    })(),
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.reload();
                        }
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: (function() {
                        if (isOSX(process.platform)) {
                            return 'Command+Q';
                        } else {
                            return 'Ctrl+Q';
                        }
                    })(),
                    click: function() {
                        proxtop.shutdown();
                        proxtop.app.quit();
                    }
                }
            ]
        }
    ]);
};
