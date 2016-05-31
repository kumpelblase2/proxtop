angular.module('proxtop').controller('MainController', ['$scope', 'ipc', '$state', 'notification', '$mdToast', '$translate', 'settings', '$mdDialog', 'open', '$window', 'debounce',
    function($scope, ipc, $state, notification, $mdToast, $translate, settings, $mdDialog, open, $window, debounce) {
        ipc.setup($scope);
        ipc.once('check-login', function(ev, result) {
            if(result) {
                ipc.send('watchlist-update');
                $state.go('profile');
            } else {
                $state.go('login');
            }
        });

        ipc.on('error', function(ev, severity, message) {
            $mdToast.show($mdToast.simple().hideDelay(5000).textContent(severity + ':' + message));
        });

        const displayNotification = function(type) {
            return function(ev, update) {
                notification.displayNotification(update.title, update.content, update.icon, function() {
                    if(type == 'anime') {
                        open.openAnime(update.id, update.episode, update.sub);
                    } else {
                        open.openManga(update.id, update.episode, update.sub);
                    }
                });
            };
        };

        $translate.use(settings.get('general').language);

        ipc.on('new-anime-ep', displayNotification('anime'));
        ipc.on('new-manga-ep', displayNotification('manga'));
        ipc.on('new-message', function(ev, message) {
            notification.displayNotification(message.title, message.content, message.icon, function() {
                $state.go('message', { id: message.id });
            });
        });

        ipc.once('update', function(ev, release) {
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

        $scope.updateOnlineState = debounce(function(state) {
            ipc.send('connectivity', state);
        }, 200);

        $window.addEventListener('online', function() {
            $scope.$apply(function() {
                $scope.updateOnlineState(true);
            });
        }, false);

        $window.addEventListener('offline', function() {
            $scope.$apply(function() {
                $scope.updateOnlineState(false);
            });
        }, false);

        ipc.send('check-login');
}]);
