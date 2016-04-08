const { ipcMain } = require('electron');

class IPCHandler {
    handle(event, funct) {
        const localFunc = funct.bind(this);
        ipcMain.on(event, function(ev, ...args) {
            localFunc(...args).then(function(...result) {
                ev.sender.send(event, ...result);
            });
        });
    }

    provide(event, func) {
        const localFunc = func.bind(this);
        ipcMain.on(event, localFunc);
    }
}

module.exports = IPCHandler;
