const path = require('path');
const settings = require('./settings');
const API = require('./api');
const ProxerAPI = require('./proxerapi');
const ProxtopMenu = require('./menu');
const { Menu } = require('electron');
const utils = require('./utils');
const NotificationManager = require('./notification_manager');

class Proxtop {
    constructor(app, window_manager, updater, tray, options) {
        this.app = app;
        this.window_manager = window_manager;
        this.name = options.name;
        this.app_dir = options.app_dir;
        this.proxer_url = options.proxer_url;
        this.info = options.info;
        this.updater = updater;
        this.api = new API(settings);
        this.proxer_api = new ProxerAPI(this, path.join(this.app_dir, "cookies.json"));
        this.tray = tray;
        this.notification_manager = new NotificationManager(this.tray, this);
    }

    start() {
        this.setupApp();
        this.updater.start(this.info.version, (release) => this.notifyUpdate(release));
        this.api.init();
        const self = this;
        return this.proxer_api.init().then(function() {
            if(!utils.isNotificationSupported()) {
                self.tray.create();
            }
        }).then(function() {
            self.openMainWindow();
        });
    }

    shutdown() {
        this.updater.stop();
    }

    displayNotification(notification) {
        this.notification_manager.displayNotification(notification);
    }

    notifyWindow(...params) {
        const mainWindow = this.window_manager.getMainWindow();
        mainWindow.send.apply(mainWindow, params);
    }

    notifyUpdate(release) {
        this.notifyWindow('update', release);
    }

    getCookies() {
        return this.window_manager.getMainWindow().webContents.session.cookies;
    }

    getSettings() {
        return settings;
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
            self.openMainWindow();
        });

        this.menu = ProxtopMenu(this);
        Menu.setApplicationMenu(this.menu);
    }

    openMainWindow() {
        this.window_manager.createMainWindow();
    }
}

module.exports = Proxtop;
