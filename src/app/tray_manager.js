const { Tray } = require('electron');
const _ = require('lodash');

class ProxtopTray {
    constructor(icon) {
        this.icon = icon;
    }

    create() {
        this.tray = this.tray || new Tray(this.icon);
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
        return this.tray.displayBaloon(title, options);
    }
}

module.exports = ProxtopTray;
