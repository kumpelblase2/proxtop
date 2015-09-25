angular.module('proxtop').service('settings', ['ipc', function(ipc) {
    this.get = function() {
        return ipc.sendSync('settings', 'get');
    }

    this.set = function(settings) {
        ipc.sendSync('settings', 'set', settings);
    }
}]);
