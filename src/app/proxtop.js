const path = require('path');
const settings = require('./settings');
const API = require('./api');
const ProxerAPI = require('./proxerapi');
const ProxtopMenu = require('./ui/menu');
const utils = require('./util/utils');
const { ipcMain, Menu } = require('electron');
const notification = require('./notification');
const windowManager = require('./ui/window_manager');

class Proxtop {
    constructor(app, updater, tray, options) {
        this.app = app;
        this.name = options.name;
        this.app_dir = options.app_dir;
        this.proxer_url = options.proxer_url;
        this.info = options.info;
        this.updater = updater;
        this.api = new API(settings);
        this.proxer_api = new ProxerAPI(this, path.join(this.app_dir, "cookies.json"));
        this.tray = tray;
    }

    start() {
        this.setupApp();
        notification.setup(this.tray);
        this.updater.start(this.info.version, (release) => windowManager.notifyWindow('update', release));
        this.api.init();
        return this.proxer_api.init().then(() => {
            if(!utils.isNotificationSupported()) {
                this.tray.create();
            }
        }).then(() => {
            windowManager.createMainWindow();
        });
    }

    shutdown() {
        this.updater.stop();
    }

    setupApp() {
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
            windowManager.createMainWindow();
        });

        this.menu = ProxtopMenu(this);
        Menu.setApplicationMenu(this.menu);

        ipcMain.on('open-about', () => {
            windowManager.createAboutWindow();
        });
    }
}

module.exports = Proxtop;
