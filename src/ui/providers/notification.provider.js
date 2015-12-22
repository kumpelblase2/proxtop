angular.module('proxtop').service('notification', ['notifier', function(notifier) {
    this.displayNotification = function(title, message, image, callback) {
        current_loc = window.location.pathname;
        notifier.notify({
            title: title,
            message: message,
            icon: current_loc.substring(0, current_loc.lastIndexOf('/')) + '/' + image,
            callback: callback
        })
    };
}]);
