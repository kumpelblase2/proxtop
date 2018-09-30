import TrayBubbleProvider from "./tray_bubble_provider";
import * as os from "os";
import NativeNotificationProvider from "./native_provider";
import NotificationProvider, { NotificationDefinition } from "./notification_provider";

export function areNotificationsNativelySupported(platform = os.platform(), release = os.release()) {
    return platform !== 'win32' || release.startsWith('10.');
}

class Notifications {
    private provider: NotificationProvider;

    constructor() {
        if(areNotificationsNativelySupported()) {
            this.provider = new NativeNotificationProvider();
        } else {
            this.provider = new TrayBubbleProvider();
        }
    }


    public displayNotification(notification: NotificationDefinition, callback: Function) {
        this.provider.displayNotification(notification, callback);
    }
}

export const Instance = new Notifications();
