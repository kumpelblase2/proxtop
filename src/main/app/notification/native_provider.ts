import NotificationProvider, { NotificationDefinition } from "./notification_provider";
import { ipcMain } from 'electron';
import windowManager from "../ui/window_manager";

export default class NativeProvider implements NotificationProvider {

    private callbacks = new Map<number,Function>();
    private currentId = 1;

    constructor() {
        ipcMain.on('__displayNotificationCallback', (event, callbackInfo) => {
            const callback = this.callbacks.get(callbackInfo);
            callback();
            this.callbacks.delete(callbackInfo);
        });
    }

    displayNotification(notification: NotificationDefinition, callback: Function) {
        notification.id = this.currentId;
        this.callbacks.set(this.currentId, callback);
        windowManager.notifyWindow('__displayNotification', notification);
        this.currentId += 1;
    }
}
