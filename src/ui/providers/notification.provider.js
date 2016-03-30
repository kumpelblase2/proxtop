angular.module('proxtop').service('notification', [function() {
    const remote = require('remote');
    const os = remote.require('os');
    const path = remote.require('path');
    const tray = remote.Tray;

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
            const temp = new tray(image);
            temp.displayBalloon({
                icon: image,
                title: title,
                content: message
            });

            temp.on('balloon-closed', function() {
                temp.destroy();
            });

            temp.on('balloon-click', function() {
                callback();
                temp.destroy();
            });
        }
    };
}]);
