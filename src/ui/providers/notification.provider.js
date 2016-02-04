angular.module('proxtop').service('notification', [function() {
    this.displayNotification = function(title, message, image, callback) {
        current_loc = window.location.pathname;
        var notification = new Notification(title, {
            body: message,
            icon: image
        });

        notification.onclick = callback;
        return notification;
    };
}]);
