const { Tray, Menu, app } = require('electron');
const _ = require('lodash');

class ProxtopTray {
    constructor() {
        this.icon = null;
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
        options.title = title;
        this.last_balloon = options;
        return this.tray.displayBalloon(options);
    }
}

module.exports = new ProxtopTray();
