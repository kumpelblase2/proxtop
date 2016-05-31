angular.module('proxtop').service('ipcManager', ['$log',function($log) {
    class IpcManager {
        constructor(ipcMain, scope, logger) {
            this.ipc = ipcMain
            this.events = new Map();
            this.log = logger;
            scope.$on('$destroy', () => {
                const allEvents = this.events;
                const ipc = this.ipc;
                this.events.forEach((listeners, event) => {
                    this.log.debug(`Remove listeners (${listeners.length}) for event ${event}`);
                    listeners.forEach((listener) => {
                        ipc.removeListener(event, listener);
                    });
                });
                this.events.clear();
            });
        }

        on(event, listener) {
            this.log.debug("Register new listener for " + event);
            this.events.set(event, (this.events.get(event) || []).concat(listener));
            this.ipc.on(event, listener);
        }

        once(event, listener) {
            const newListener = (...args) => {
                this.log.debug("Once event fired " + event);
                this.removeListenerFromMap(event, newListener);
                listener(...args);
            }
            this.log.debug("Register new once listener for " + event);
            this.events.set(event, (this.events.get(event) || []).concat(newListener));
            this.ipc.on(event, newListener);
        }

        removeListener(event, listener) {
            this.ipc.removeListener(event, listener);
            this.removeListenerFromMap(event, listener);
            this.log.debug("Removed listener from ipc event" + event);
        }

        removeListenerFromMap(event, listener) {
            if(this.events.has(event)) {
                const listeners = this.events.get(event);
                const newListeners = listeners.filter((a) => a !== listener);
                if(newListeners.length > 0) {
                    this.events.set(event, newListeners);
                } else {
                    this.events.delete(event);
                }
                this.log.debug("Removed listener from map for event " + event);
            }
        }

        send(...args) {
            this.ipc.send(...args);
        }

        sendSync(...args) {
            return this.ipc.sendSync(...args);
        }
    }

    return (scope) => {
        return new IpcManager(require('electron').ipcRenderer, scope, $log);
    };
}]);
