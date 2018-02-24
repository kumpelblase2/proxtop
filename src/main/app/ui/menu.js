const { Menu } = require('electron');
const windowManager = require('./window_manager');

module.exports = function(proxtop) {
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
                        if (process.platform == 'darwin') {
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
                        if (process.platform == 'darwin') {
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
                        if (process.platform == 'darwin') {
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
}
