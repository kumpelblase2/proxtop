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
    
    setup() {
        if(this.areNativelySupported()) {
            this.provider = new NativeNotificationProvider();
        } else {
            this.provider = TrayBubbleProvider;
        }
    }
    
    displayNotification(notification, callback = () => {}) {
        if(!this.provider) {
            this.setup();
        }
        
        this.provider.displayNotification(notification, callback);
    }
}

module.exports = new Notifications();