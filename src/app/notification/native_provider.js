const { ipcMain } = require('electron');
const windowManager = require('../ui/window_manager');

class NativeNotificationProvider {
    constructor() {
        this.callbacks = new Map();
        ipcMain.on('__displayNotificationCallback', (event, callback_info) => {
            const callback = this.callbacks.get(callback_info);
            callback();
            this.callbacks.delete(callback_info);
        });
        this.currentId = 1;
    }

    displayNotification(notification, callback) {
        notification.id = this.currentId;
        this.callbacks.set(this.currentId, callback);
        windowManager.notifyWindow('__displayNotification', notification);
        this.currentId += 1;
    }
}

module.exports = NativeNotificationProvider;