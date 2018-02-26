import NotificationProvider, { NotificationDefinition } from "./notification_provider";
import tray_manager from "../ui/tray_manager";

export default class TrayBubbleProvider implements NotificationProvider {
    displayNotification(notification: NotificationDefinition, callback: Function) {
        tray_manager.displayBaloon(notification.title, {
            content: notification.message,
            onclick: callback
        })
    }
}
