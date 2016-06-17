(() => {
    const { ipcRenderer, remote } = require('electron');
    const os = remote.require('os');

    const htmlNotifications = os.platform() != 'win32' || os.release().startsWith('10.');
    if(htmlNotifications) {
        ipcRenderer.on('__displayNotification', (ev, notify) => {
            const notification = new Notification(notify.title, {
                body: notify.message,
                icon: notify.icon
            });

            notification.onclick = () => {
                ipcRenderer.send('__displayNotificationCallback', notify.id);
            };
        });
    }
})();