angular.module('proxtop').service('notification', [function() {
    const remote = require('remote');
    const os = remote.require('os');
    const path = remote.require('path');
    const tray = remote.Tray;

    this.trayIcon = null;

    this.displayNotification = function(title, message, image, callback) {
        if(os.platform() != 'win32' || /10\..+/.test(os.release())) {
            const notification = new Notification(title, {
                body: message,
                icon: image
            });

            notification.onclick = callback;
            return notification;
        } else {
            image = path.join(__dirname, image);
            this.trayIcon = this.trayIcon || new tray(image);
            this.trayIcon.displayBalloon({
                icon: image,
                title: title,
                content: message
            });
        }
    };
}]);
