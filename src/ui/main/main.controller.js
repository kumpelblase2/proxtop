angular.module('proxtop').controller('MainController', ['$scope', 'ipc', '$state', 'notification', '$mdToast', 'settings', function($scope, ipc, $state, notification, $mdToast, settings) {
    ipc.on('check-login', function(result) {
        if(result) {
            $state.go('profile');
        } else {
            $state.go('login');
        }
    });

    ipc.on('error', function(severity, message) {
        $mdToast.show($mdToast.simple().content(severity + ':' + message));
    });

    ipc.on('new-anime-ep', function(update) {
        var settings = settings.get('watchlist');
        if(settings.display_notification) {
            notification.displayNotification('Proxtop', 'Episode ' + update.ep + ' of ' + update.name + ' is now available', '', function() {
                open.openAnime(update.id, update.ep, update.sub);
            });
        }
    });

    ipc.on('new-manga-ep', function(update) {
        var settings = settings.get('watchlist');
        if(settings.display_notification) {
            notification.displayNotification('Proxtop', 'Episode ' + update.ep + ' of ' + update.name + ' is now available', '', function() {
                open.openManga(update.id, update.ep, update.sub);
            });
        }
    });

    ipc.send('check-login');
}]);
