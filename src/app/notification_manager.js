const { ipcMain } = require('electron');
const utils = require('./util/utils');
const path = require('path');

class NotificationManager {
    constructor(tray, app) {
        this.tray = tray;
        this.id = 0;
        this.app = app;
        this.callbacks = new Map();
        ipcMain.on('notification-callback', (event, callback_info) => {
            callback = this.callbacks.get(callback_info.id);
            callback();
            this.callbacks.delete(callback_info.id);
        });
    }

    displayNotification(notification) {
        if(utils.isNotificationSupported()) {
            notification.id = this.id;
            this.callbacks.set(this.id, notification.onclick);
            this.app.notifyWindow(notification.type, notification);
            this.id += 1;
        } else {
            this.tray.displayBaloon(notification.title, {
                content: notification.content,
                onclick: notification.onclick
            });
        }
    }
}

module.exports = NotificationManager;
