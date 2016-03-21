var BrowserWindow = require('browser-window');
var WindowState = require('electron-window-state');
var Shell = require('shell');

function WindowManager(dirs) {
    this.mainWindow = null;
    this.app_dir = dirs.app;
    this.index_location = dirs.index;
    this.logo_location = dirs.logo;
}

WindowManager.prototype.getMainWindow = function() {
    return this.mainWindow;
};

WindowManager.prototype.createMainWindow = function() {
    LOG.verbose('Opening new window');
    var self = this;
    var windowState = WindowState({
        defaultWidth: 800,
        defaultHeigth: 600,
        path: this.app_dir
    });

    this.mainWindow = new BrowserWindow({
        width: windowState.width,
        height: windowState.height,
        y: windowState.y,
        x: windowState.x,
        'auto-hide-menu-bar': true,
        icon: this.logo_location
    });

    this.mainWindow.loadURL('file://' + this.index_location);
    this.mainWindow.on('closed', function() {
        self.mainWindow = null;
    });

    this.mainWindow.webContents.on('new-window', function(ev, url) {
        LOG.verbose('Prevent new window and open externally instead.');
        ev.preventDefault();
        Shell.openExternal(url);
    });

    windowState.manage(this.mainWindow);
};

module.exports = WindowManager;
