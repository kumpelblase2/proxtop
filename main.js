var app = require('app');
var BrowserWindow = require('browser-window');
var settings = require('./src/app/settings');
var global = require('./src/app/global');
var path = require("path");
var logger = require('./src/app/logger');
var winston = require("winston");
var Proxtop = require('./src/app/proxtop');

var proxApp = new Proxtop();

var mainWindow = null;
var appData = {
    name: global.NAME,
    getWindow: function() { return mainWindow; },
    proxtop: proxApp,
    appdir: path.join(app.getPath("appData"), global.NAME)
};

app.on('window-all-closed', function() {
    if(process.platform != 'darwin') {
        proxApp.finish().then(app.quit);
    }
});

app.on('ready', function() {
    proxApp.init(appData.appdir).then(createWindow);
});

function createWindow() {
    logger.verbose('Opening new window');
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        'auto-hide-menu-bar': true
    });

    mainWindow.loadUrl('file://' + global.INDEX_LOCATION);
    mainWindow.on('closed', function() {
        mainWindow = null;
    });
}

module.exports = appData;
