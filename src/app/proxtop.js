const path = require('path');
const settings = require('./settings');
const API = require('./api');
const proxerAPI = require('./proxerapi');
const ProxtopMenu = require('./ui/menu');
const { ipcMain, Menu } = require('electron');
const notification = require('./notification');
const windowManager = require('./ui/window_manager');
const tray = require('./ui/tray_manager');
const { SessionHandler } = require('./lib');

class Proxtop {
    constructor(app, updater, options) {
        this.app = app;
        this.app_dir = options.app_dir;
        this.info = options.info;
        this.updater = updater;
        this.session_handler = new SessionHandler(this, path.join(this.app_dir, "cookies.json"));
        this.proxer_api = proxerAPI(this.session_handler);
        this.api = new API(this.proxer_api);
    }

    start() {
        this.setupApp();
        this.updater.start(this.info.version, (release) => windowManager.notifyWindow('update', release));

        return this.session_handler.loadState().then(() => {
            this.api.init();
        }).then(windowManager.createMainWindow.bind(windowManager));
    }

    shutdown() {
        this.updater.stop();
    }

    setupApp() {
        this.app.on('window-all-closed', () => {
            if(process.platform != 'darwin') {
                this.shutdown();
                this.app.quit();
            }
        });

        // TODO check if this still works on OSX
        this.app.on('activate-with-no-open-windows', (event) => {
            event.preventDefault();
            windowManager.createMainWindow();
        });

        this.menu = ProxtopMenu(this);
        Menu.setApplicationMenu(this.menu);

        ipcMain.on('open-about', () => {
            windowManager.createAboutWindow();
        });

        if(!notification.areNativelySupported()) {
            tray.create();
        }
    }
}

module.exports = Proxtop;
