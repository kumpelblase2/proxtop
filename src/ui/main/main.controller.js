angular.module('proxtop').controller('MainController', ['$scope', 'ipc', '$state', 'notification', '$mdToast', function($scope, ipc, $state, notification, $mdToast) {
    ipc.on('check-login', function(result) {
        if(result) {
            ipc.send('watchlist-update');
            $state.go('profile');
        } else {
            $state.go('login');
        }
    });

    ipc.on('error', function(severity, message) {
        $mdToast.show($mdToast.simple().content(severity + ':' + message));
    });

    var displayNotification = function(type) {
        return function(update) {
            notification.displayNotification('Proxtop', 'Episode ' + update.ep + ' of ' + update.name + ' is now available', '', function() {
                if(type == 'anime') {
                    open.openAnime(update.id, update.ep, update.sub);
                } else {
                    open.openManga(update.id, update.ep, update.sub);
                }
            });
        };
    };

    ipc.on('new-anime-ep', displayNotification('anime'));
    ipc.on('new-manga-ep', displayNotification('manga'));

    ipc.send('check-login');
}]);
