const { ipcMain } = require('electron');

class NativeNotificationProvider {
    constructor(proxtop) {
        this.app = proxtop;
        this.callbacks = new Map();
        ipcMain.on('__displayNotificationCallback', (event, callback_info) => {
            callback = this.callbacks.get(callback_info.id);
            callback();
            this.callbacks.delete(callback_info.id);
        });
        this.currentId = 1;
    }

    displayNotification(notification, callback) {
        notification.id = this.currentId;
        this.callbacks.set(this.currentId, callback);
        this.app.notifyWindow('__displayNotification', notification);
        this.currentId += 1;
    }
}

module.exports = NativeNotificationProvider;