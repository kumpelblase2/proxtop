import path from "path";
import { areNotificationsNativelySupported } from "./notification";
import { ipcMain, Menu } from "electron";
import SessionHandler from "./lib/session_handler";
import API from "./api";
import windowManager from "./ui/window_manager";
import tray from "./ui/tray_manager";
import createProxtopMenu from "./ui/menu";
import createProxerApi from "./proxerapi";

export default class Proxtop {
    constructor(app, updater, options) {
        this.app = app;
        this.app_dir = options.app_dir;
        this.updater = updater;
        this.session_handler = new SessionHandler(this, options.api_key, path.join(this.app_dir, "cookies.json"));
        this.proxer_api = createProxerApi(this.session_handler);
        this.api = new API(this.proxer_api);
    }

    start() {
        this.setupApp();
        this.updater.start((release) => windowManager.notifyWindow('update', release));

        return this.session_handler.loadState().then(() => {
            this.api.init();
        }).then(windowManager.createMainWindow.bind(windowManager));
    }

    shutdown() {
        this.updater.stop();
    }

    setupApp() {
        this.app.on('window-all-closed', () => {
            if(process.platform !== 'darwin') {
                this.shutdown();
                this.app.quit();
            }
        });

        // TODO check if this still works on OSX
        this.app.on('activate-with-no-open-windows', (event) => {
            event.preventDefault();
            windowManager.createMainWindow();
        });

        this.menu = createProxtopMenu(this);
        Menu.setApplicationMenu(this.menu);

        ipcMain.on('open-about', () => {
            windowManager.createAboutWindow();
        });

        if(!areNotificationsNativelySupported()) {
            tray.create();
        }
    }
}
