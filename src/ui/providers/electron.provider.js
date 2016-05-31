angular.module('proxtop').service('info', ['ipc' , function() {
    this.getInfo = function() {
        return ipc.send('system');
    }
}]);

angular.module('proxtop').factory('shell', function() {
    return require('electron').shell;
});
