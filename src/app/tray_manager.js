const { Tray, Menu, app } = require('electron');
const _ = require('lodash');

class ProxtopTray {
    constructor(icon) {
        this.icon = icon;
        this.last_balloon = null;
    }

    create() {
        this.tray = this.tray || new Tray(this.icon);
        this.tray.setToolTip(APP_NAME);
        this.tray.on('balloon-click', () => {
            if(this.last_balloon.onclick) {
                this.last_balloon.onclick();
            }
        });
        this.setupContextMenu();
    }

    setupContextMenu() {
        this.menu = Menu.buildFromTemplate([
            {
                label: 'Quit',
                click: function() {
                    app.quit();
                }
            }
        ]);

        this.tray.setContextMenu(this.menu);
    }

    destroy() {
        if(this.tray) {
            this.tray.destroy();
        }
    }

    exists() {
        return this.tray;
    }

    displayBaloon(title, options) {
        if(!this.exists()) {
            this.create();
        }

        options = _.defaults(options, { icon: this.icon, content: "" });
        this.last_balloon = options;
        return this.tray.displayBaloon(title, options);
    }
}

module.exports = ProxtopTray;
