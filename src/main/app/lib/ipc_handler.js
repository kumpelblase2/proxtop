const { ipcMain } = require('electron');

function isPromise(object) {
    return object && object.then && typeof(object.then) === 'function';
}

function isGenerator(object) {
    return object && object[Symbol.iterator] && typeof(object[Symbol.iterator]) === 'function';
}

class IPCHandler {
    handle(event, funct, binding = this) {
        const localFunc = funct.bind(binding);
        ipcMain.on(event, (ev, ...args) => {
            const localFuncResult = localFunc(...args);
            if(isPromise(localFuncResult)) {
                localFuncResult.then((...result) => {
                    ev.sender.send(event, ...result);
                });
            } else if(isGenerator(localFuncResult)) {
                for(let result of localFuncResult) {
                    if(isPromise(result)) {
                        result.then((...result) => {
                            ev.sender.send(event, ...result);
                        });
                    } else {
                        ev.sender.send(event, result);
                    }
                }
            } else {
                ev.sender.send(event, localFuncResult);
            }
        });
    }

    handleSync(event, funct, binding = this) {
        const localFunc = funct.bind(binding);
        ipcMain.on(event, (ev, ...args) => {
            const localFuncResult = localFunc(...args);
            if(isPromise(localFuncResult)) {
                localFuncResult.then((result) => {
                    ev.returnValue = result;
                });
            } else {
                ev.returnValue = localFuncResult;
            }
        });
    }

    provide(event, func) {
        const localFunc = func.bind(this);
        ipcMain.on(event, localFunc);
    }
}

module.exports = IPCHandler;
