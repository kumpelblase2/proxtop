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
        var severityTranslation = "ERROR_SEVERITY." + severity;
        var messageTranslation = "ERROR." + message;
        severity = $translate([severityTranslation, messageTranslation]).then(function(translations) {
            severity = translations[severityTranslation];
            message = translations[messageTranslation];
            $mdToast.show($mdToast.simple().hideDelay(5000).textContent(severity + ':' + message));
        });
    });

    var displayNotification = function(ev, type) {
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

    ipc.on('update', function(ev, release) {
        var yes = "UPDATE.YES";
        var no = "UPDATE.NO";
        var newVersion = "UPDATE.NEW_VERSION";

        var content = release.body;
        content = content.replace(/\r\n/g, "<br>");

        $translate([yes, no, newVersion]).then(function(translations) {
            var dialog = $mdDialog.confirm()
                .title(translations[newVersion])
                .textContent("Version " + release.tag_name + " - " + release.name + "<br><br>" + content)
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
