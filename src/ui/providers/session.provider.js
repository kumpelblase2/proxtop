angular.module('proxtop').service('session', ['ipc', function(ipc) {
    this.loggedIn = false;
    this.handlers = [];
    this.errorHandlers = [];

    this.onLogin = (handler, errorHandler) => {
        this.handlers.push(handler);
        if(errorHandler) {
            this.errorHandlers.push(errorHandler);
        }
    };

    this.isLoggedIn = () => {
        return this.loggedIn;
    };

    this.getUser = () => {
        return ipc.sendSync('current-user');
    };

    ipc.once('check-login', (ev, result) => {
        if(result) {
            this.handlers.forEach((handler) => {
                handler();
            });
            this.loggedIn = true;
        } else {
            this.errorHandlers.forEach((handler) => {
                handler();
            });

            this.loggedIn = false;
        }

        this.handlers = [];
        this.errorHandlers = [];
    });

    ipc.on('login', (ev, result) => {
        this.loggedIn = !!(result && result.success);
    });

    ipc.on('logout', (ev, result) => {
        this.loggedIn = result && !result.success;
    });

    this.checkLogin = () => {
        ipc.send('check-login');
    };
}]);