import { APP_NAME } from "../globals";
import * as _ from "lodash";
import { app, Menu, Tray, NativeImage, DisplayBalloonOptions } from 'electron';

class ProxtopTray {
    tray: Tray;
    lastBalloon: DisplayBalloonOptions;
    icon: NativeImage | string;
    menu: Menu;

    constructor() {
    }

    create() {
        this.tray = this.tray || new Tray(this.icon);
        this.tray.setToolTip(APP_NAME);
        this.tray.on('balloon-click', () => {
            // @ts-ignore
            if(this.lastBalloon.onclick) { // TODO: why does this _ever_ had onclick?
                // @ts-ignore
                this.lastBalloon.onclick();
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
        if(this.exists()) {
            this.tray.destroy();
        }
    }

    exists(): boolean {
        return this.tray != null;
    }

    displayBaloon(options: DisplayBalloonOptions) {
        if(!this.exists()) {
            this.create();
        }

        options = _.defaults(options, { icon: this.icon, content: "" });
        this.lastBalloon = options;
        this.tray.displayBalloon(options);
    }
}

export default new ProxtopTray();
