angular.module('proxtop').service('notification', [function() {
    var remote = require('remote');
    var os = remote.require('os');
    var path = remote.require('path');
    var tray = remote.Tray;

    this.displayNotification = function(title, message, image, callback) {
        if(os.platform() != 'win32' || /10\..+/.test(os.release())) {
            var notification = new Notification(title, {
                body: message,
                icon: image
            });

            notification.onclick = callback;
            return notification;
        } else {
            image = path.join(__dirname, image);
            var temp = new tray(image);
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
