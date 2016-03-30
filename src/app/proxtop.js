const path = require('path');
const settings = require('./settings');
const API = require('./api');
const ProxerAPI = require('./proxerapi');
const Menu = require('electron').Menu;

function Proxtop(app, window_manager, updater, options) {
    this.app = app;
    this.window_manager = window_manager;
    this.name = options.name;
    this.app_dir = options.app_dir;
    this.proxer_url = options.proxer_url;
    this.info = options.info;
    this.updater = updater;
    this.api = new API(settings);
    this.proxer_api = new ProxerAPI(this, path.join(this.app_dir, "cookies.json"));
}

Proxtop.prototype.start = function() {
    this.setupApp();
    this.updater.start(this.info.version, this.notifyUpdate.bind(this));
    this.api.init();
    const self = this;
    return this.proxer_api.init().then(function() {
        self.window_manager.createMainWindow();
    });
};

Proxtop.prototype.shutdown = function() {
    this.updater.stop();
};

Proxtop.prototype.notifyWindow = function() {
    const params = Array.prototype.slice.call(arguments);
    const mainWindow = this.window_manager.getMainWindow();
    mainWindow.send.apply(mainWindow, params);
};

Proxtop.prototype.notifyUpdate = function(release) {
    this.notifyWindow('update', release);
};

Proxtop.prototype.getSettings = function() {
    return settings;
};

Proxtop.prototype.setupApp = function() {
    const self = this;
    this.app.on('window-all-closed', function() {
        if(process.platform != 'darwin') {
            self.shutdown();
            self.app.quit();
        }
    });

    // TODO check if this still works on OSX
    this.app.on('activate-with-no-open-windows', function(event) {
        event.preventDefault();
        self.window_manager.createMainWindow();
    });

    const menu = Menu.buildFromTemplate([
        {
            label: 'Proxtop',
            submenu: [
                {
                    label: 'About',
                    role: 'about',
                    click: function() {
                        self.window_manager.createAboutWindow();
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
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: function() { self.app.quit(); }
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);
};

module.exports = Proxtop;
