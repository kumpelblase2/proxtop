angular.module('proxtop').factory('ipc', function() {
    return require('ipc');
});

angular.module('proxtop').service('info', ['ipc' , function() {
    this.getInfo = function() {
        return ipc.send('system');
    }
}]);
