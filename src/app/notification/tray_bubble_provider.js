const tray = require('../ui/tray_manager');

module.exports = {
    displayNotification: (notification, callback) => {
        tray.displayBaloon(notification.title, {
            content: notification.message,
            onclick: callback
        });
    }
};