var path = require('path');
var settings = require('./settings');
var API = require('./api');
var ProxerAPI = require('./proxerapi');
var Menu = require('electron').Menu;

function Proxtop(app, window_manager, updater, options) {
    this.app = app;
    this.window_manager = window_manager;
    this.name = options.name;
    this.app_dir = options.app_dir;
    this.proxer_url = options.proxer_url;
    this.info = options.info;
    this.updater = updater;
    this.api = new API(settings);
    this.proxer_api = new ProxerAPI(this, path.join(this.app_dir, "cookies.json"));
}

Proxtop.prototype.start = function() {
    this.setupApp();
    this.updater.start(this.info.version, this.notifyUpdate.bind(this));
    this.api.init();
    var self = this;
    return this.proxer_api.init().then(function() {
        self.window_manager.createMainWindow();
    });
};

Proxtop.prototype.shutdown = function() {
    this.updater.stop();
};

Proxtop.prototype.notifyWindow = function() {
    var params = Array.prototype.slice.call(arguments);
    var mainWindow = this.window_manager.getMainWindow();
    mainWindow.send.apply(mainWindow, params);
};

Proxtop.prototype.notifyUpdate = function(release) {
    this.notifyWindow('update', release);
};

Proxtop.prototype.getSettings = function() {
    return settings;
};

Proxtop.prototype.setupApp = function() {
    var self = this;
    this.app.on('window-all-closed', function() {
        if(process.platform != 'darwin') {
            //TODO somehow the app is still alive sometimes
            self.shutdown();
            self.app.quit();
        }
    });

    // TODO check if this still works on OSX
    this.app.on('activate-with-no-open-windows', function(event) {
        event.preventDefault();
        self.window_manager.createMainWindow();
    });

    var menu = Menu.buildFromTemplate([
        {
            label: 'Proxtop',
            submenu: [
                {
                    label: 'About',
                    click: function() {
                        self.window_manager.createAboutWindow()
                    }
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);
};

module.exports = Proxtop;
