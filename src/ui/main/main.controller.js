angular.module('proxtop').controller('MainController', ['$scope', 'ipc', '$state', 'notification', '$mdToast', '$translate', "settings", function($scope, ipc, $state, notification, $mdToast, $translate, settings) {
    ipc.on('check-login', function(result) {
        if(result) {
            ipc.send('watchlist-update');
            $state.go('profile');
        } else {
            $state.go('login');
        }
    });

    ipc.on('error', function(severity, message) {
        var severityTranslation = "ERROR_SEVERITY." + severity;
        var messageTranslation = "ERROR." + message;
        severity = $translate([severityTranslation, messageTranslation]).then(function(translations) {
            severity = translations[severityTranslation];
            message = translations[messageTranslation];
            $mdToast.show($mdToast.simple().hideDelay(5000).content(severity + ':' + message));
        });
    });

    var displayNotification = function(type) {
        return function(update) {
            $translate('WATCHLIST.NEW_' + type.toUpperCase(), { episode: update.episode, name: update.name}).then(function(translations) {
                notification.displayNotification('Proxtop', translations, 'assets/proxer_logo_64.png', function() {
                    if(type == 'anime') {
                        open.openAnime(update.id, update.episode, update.sub);
                    } else {
                        open.openManga(update.id, update.episode, update.sub);
                    }
                });
            });
        };
    };

    $translate.use(settings.get('general').language);

    ipc.on('new-anime-ep', displayNotification('anime'));
    ipc.on('new-manga-ep', displayNotification('manga'));

    ipc.send('check-login');
}]);
