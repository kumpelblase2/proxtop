angular.module('proxtop').factory('ipc', function() {
    return require('ipc');
});

angular.module('proxtop').factory('notifier', function() {
    return require('node-notifier');
});

angular.module('proxtop').service('info', ['ipc' , function() {
    this.getInfo = function() {
        return ipc.send('system');
    }
}]);
