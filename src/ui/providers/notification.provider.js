angular.module('proxtop').service('notification', ['notifier', function(notifier) {
    this.displayNotification = function(title, message, image, callback) {
        notifier.notify({
            title: title,
            message: message,
            icon: image,
            callback: callback
        })
    };
}]);
