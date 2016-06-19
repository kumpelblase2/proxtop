const { BrowserWindow, shell } = require('electron');
const WindowState = require('electron-window-state');
const openAboutWindow = require('about-window').default;

class WindowManager {
    constructor() {
        this.mainWindow = null;
    }

    setDirs(dirs) {
        this.app_dir = dirs.app;
        this.index_location = dirs.index;
        this.logo_location = dirs.logo;
    }

    getMainWindow() {
        return this.mainWindow;
    }

    createMainWindow() {
        LOG.verbose('Opening new window');
        const windowState = WindowState({
            defaultWidth: 800,
            defaultHeigth: 600,
            path: this.app_dir
        });

        this.mainWindow = new BrowserWindow({
            width: windowState.width,
            height: windowState.height,
            y: windowState.y,
            x: windowState.x,
            autoHideMenuBar: true,
            icon: this.logo_location
        });

        this.mainWindow.loadURL('file://' + this.index_location);
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });

        this.mainWindow.webContents.on('new-window', (ev, url) => {
            LOG.verbose('Prevent new window and open externally instead.');
            ev.preventDefault();
            OpenHandler.openExternal(url);
        });

        windowState.manage(this.mainWindow);
    }

    createAboutWindow() {
        openAboutWindow({
            icon_path: this.logo_location
        });
    }

    notifyWindow(...params) {
        const mainWindow = this.getMainWindow();
        mainWindow.send.apply(mainWindow, params);
    }
}

module.exports = new WindowManager();
