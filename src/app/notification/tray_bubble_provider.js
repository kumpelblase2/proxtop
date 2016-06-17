class TrayBubbleNotificationProvider {
    constructor(tray) {
        this.tray = tray;
    }

    displayNotification(notification, callback) {
        this.tray.displayBaloon(notification.title, {
            content: notification.message,
            onclick: callback
        });
    }
}

module.exports = TrayBubbleNotificationProvider;