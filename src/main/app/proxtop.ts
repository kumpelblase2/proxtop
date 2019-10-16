import { join } from "path";
import { areNotificationsNativelySupported } from "./notification";
import { ipcMain, App } from "electron";
import SessionHandler from "./lib/session_handler";
import API from "./api";
import windowManager from "./ui/window_manager";
import tray from "./ui/tray_manager";
import createProxtopMenu from "./ui/menu";
import createProxerApi from "./proxerapi";
import { Updater } from "./updater";

export type ProxtopOptions = {
    api_key: string,
    app_dir: string
}

export default class Proxtop {
    app: App;
    app_dir: string;
    updater: Updater;
    session_handler: SessionHandler;
    proxer_api;
    api: API;

    constructor(app: App, updater: Updater, options: ProxtopOptions) {
        this.app = app;
        this.app_dir = options.app_dir;
        this.updater = updater;
        this.session_handler = new SessionHandler(this, options.api_key, join(this.app_dir, "cookies.json"));
        this.proxer_api = createProxerApi(this.session_handler);
        this.api = new API(this.proxer_api);
    }

    start(): Promise<void> {
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

        this.app.on('activate', () => {
            if(!windowManager.hasWindowOpen()) {
                windowManager.createMainWindow();
            }
        });

        createProxtopMenu(this);

        ipcMain.on('open-about', () => {
            windowManager.createAboutWindow();
        });

        if(!areNotificationsNativelySupported()) {
            tray.create();
        }
    }
}
