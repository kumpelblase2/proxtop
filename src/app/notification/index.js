const os = require('os');

const TrayBubbleProvider = require('./tray_bubble_provider');
const NativeNotificationProvider = require('./native_provider');

class Notifications {
    constructor() {
        this.provider = null;
    }

    areNativelySupported(platform = os.platform(), release = os.release()) {
        return platform != 'win32' || release.startsWith('10.');
    }
    
    setup(app, tray) {
        if(this.areNativelySupported()) {
            this.provider = new NativeNotificationProvider(app);
        } else {
            this.provider = new TrayBubbleProvider(tray);
        }
    }
    
    displayNotification(notification, callback = () => {}) {
        if(this.provider) {
            this.provider.displayNotification(notification, callback);
        } else {
            LOG.warn("Wanted to display notification but no provider was registered so far");
        }
    }
}

module.exports = new Notifications();