angular.module('proxtop').service('notification', ['ipc', function(ipc) {
    this.displayNotification = function(title, message, image, callback) {
        ipc.send('notify', {
            title: title,
            message: message,
            icon: image
        });
    };
}]);
