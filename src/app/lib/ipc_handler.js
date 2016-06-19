const { ipcMain } = require('electron');

class IPCHandler {
    handle(event, funct, binding = this) {
        const localFunc = funct.bind(binding);
        ipcMain.on(event, (ev, ...args) => {
            const localFuncResult = localFunc(...args);
            if(localFuncResult.then) {
                localFuncResult.then((...result) => {
                    ev.sender.send(event, ...result);
                });
            } else {
                ev.sender.send(event, localFuncResult);
            }
        });
    }

    provide(event, func) {
        const localFunc = func.bind(this);
        ipcMain.on(event, localFunc);
    }
}

module.exports = IPCHandler;
