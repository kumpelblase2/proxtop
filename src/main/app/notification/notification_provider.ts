export default interface NotificationProvider {
    displayNotification(notification: NotificationDefinition, callback: Function);
}

export interface NotificationDefinition {
    id: number;
    title: string;
    message: string;
}
