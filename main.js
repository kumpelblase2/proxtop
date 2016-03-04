require('./src/app/global');
LOG.verbose('Running on ' + process.versions['electron'] + ' on chrome ' + process.versions['chrome']);

var app = require('app');
var BrowserWindow = require('browser-window');
var winston = require("winston");
var utils = require('./src/app/utils');
var WindowStateKeeper = require('electron-window-state');

utils.createDirIfNotExists(APP_DIR);
var Proxtop = require('./src/app/proxtop');
var settings = require('./src/app/settings');

var mainWindow = null;

var proxApp = new Proxtop(function(release) {
    mainWindow.send('update', release);
});

var appData = {
    name: APP_NAME,
    getWindow: function() { return mainWindow; },
    proxtop: proxApp
};

app.on('window-all-closed', function() {
    if(process.platform != 'darwin') {
        proxApp.finish();
        app.quit();
    }

    mainWindow = null;
});

app.on('activate-with-no-open-windows', function(event) {
    event.preventDefault();
    createWindow();
});

app.on('ready', function() {
    proxApp.init().then(createWindow);
});

function createWindow() {
    LOG.verbose('Opening new window');
    var windowState = WindowStateKeeper({
        defaultWidth: 800,
        defaultHeigth: 600,
        path: APP_DIR
    });

    mainWindow = new BrowserWindow({
        width: windowState.width,
        height: windowState.heigth,
        y: windowState.y,
        x: windowState.x,
        'auto-hide-menu-bar': true
    });

    mainWindow.loadURL('file://' + INDEX_LOCATION);
    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    mainWindow.webContents.on('new-window', function(ev, url) {
        ev.preventDefault();
        require('shell').openExternal(url);
    });

    windowState.manage(mainWindow);
}

module.exports = appData;
