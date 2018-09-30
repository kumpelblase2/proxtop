import Logger from "../util/log";
import { BrowserWindow, shell } from "electron";
import WindowState from "electron-window-state";
import openAboutWindow from "about-window";

interface DirLocations {
    app: string,
    index: string,
    logo: string
}

export class WindowManager {
    mainWindow?: BrowserWindow;
    appDir: string;
    indexLocation: string;
    logoLocation: string;

    setDirs(dirs: DirLocations) {
        this.appDir = dirs.app;
        this.indexLocation = dirs.index;
        this.logoLocation = dirs.logo;
    }

    getMainWindow(): BrowserWindow | null {
        return this.mainWindow;
    }

    createMainWindow() {
        Logger.verbose('Opening new window');
        const windowState = WindowState({
            defaultWidth: 800,
            defaultHeigth: 600,
            path: this.appDir
        });

        this.mainWindow = new BrowserWindow({
            width: windowState.width,
            height: windowState.height,
            y: windowState.y,
            x: windowState.x,
            autoHideMenuBar: true,
            icon: this.logoLocation
        });

        this.mainWindow.loadURL('file://' + this.indexLocation);
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        this.mainWindow.webContents.on('new-window', (ev, url) => {
            Logger.verbose('Prevent new window and open externally instead.');
            ev.preventDefault();
            shell.openExternal(url);
        });

        windowState.manage(this.mainWindow);
    }

    createAboutWindow() {
        openAboutWindow({
            icon_path: this.logoLocation
        });
    }

    notifyWindow(channel: string, ...params) {
        const mainWindow = this.getMainWindow();
        mainWindow.webContents.send(channel, ...params);
    }
}

export default new WindowManager();
