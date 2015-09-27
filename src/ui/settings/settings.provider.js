angular.module('proxtop').service('settings', ['ipc', function(ipc) {
    this.get = function(type) {
        return ipc.sendSync('settings', type);
    }

    this.set = function(type, settings) {
        ipc.sendSync('settings', type, settings);
    }
}]);
