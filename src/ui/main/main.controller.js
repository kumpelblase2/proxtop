angular.module('proxtop').controller('MainController', ['$scope', 'ipc', '$state', 'notification', '$mdToast', '$translate', 'settings', '$mdDialog', 'open', function($scope, ipc, $state, notification, $mdToast, $translate, settings, $mdDialog, open) {
    ipc.on('check-login', function(ev, result) {
        if(result) {
            ipc.send('watchlist-update');
            $state.go('profile');
        } else {
            $state.go('login');
        }
    });

    ipc.on('error', function(ev, severity, message) {
        const severityTranslation = "ERROR_SEVERITY." + severity;
        const messageTranslation = "ERROR." + message;
        severity = $translate([severityTranslation, messageTranslation]).then(function(translations) {
            severity = translations[severityTranslation];
            message = translations[messageTranslation];
            $mdToast.show($mdToast.simple().hideDelay(5000).textContent(severity + ':' + message));
        });
    });

    const displayNotification = function(type) {
        return function(ev, update) {
            $translate('WATCHLIST.NEW_' + type.toUpperCase(), { episode: update.episode, name: update.name}).then(function(translations) {
                notification.displayNotification('Proxtop', translations, 'assets/proxtop_logo_256.png', function() {
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
    ipc.on('new-message', function(ev, message) {
        $translate('MESSAGES.NEW_MESSAGE', { user: message.username }).then(function(translations) {
            notification.displayNotification('Proxtop', translations, 'assets/proxtop_logo_256.png', function() {
                $state.go('message', { id: message.id });
            });
        });
    });

    ipc.on('update', function(ev, release) {
        const yes = "UPDATE.YES";
        const no = "UPDATE.NO";
        const newVersion = "UPDATE.NEW_VERSION";

        let content = release.body;
        content = content.replace(/\r\n/g, "<br>");

        $translate([yes, no, newVersion]).then(function(translations) {
            const dialog = $mdDialog.confirm()
                .title(translations[newVersion])
                .htmlContent("Version " + release.tag_name + " - " + release.name + "<br><br>" + content)
                .ariaLabel("Update Notification")
                .ok(translations[yes])
                .cancel(translations[no]);
            $mdDialog.show(dialog).then(function() {
                open.openLink(release.html_url);
            });
        });
    });

    ipc.send('check-login');
}]);
