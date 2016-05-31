angular.module('proxtop').controller('BackgroundController', ['$scope', 'ipcManager', '$state', 'notification', '$mdToast', '$translate', '$mdDialog', 'open', '$window', 'debounce',
    function($scope, ipcManager, $state, notification, $mdToast, $translate, $mdDialog, open, $window, debounce) {
        const ipc = ipcManager($scope);
        ipc.on('error', (ev, severity, message) => {
            $mdToast.show($mdToast.simple().hideDelay(5000).textContent(severity + ':' + message));
        });

        const displayNotification = (type) => {
            return (ev, update) => {
                notification.displayNotification(update.title, update.content, update.icon, () => {
                    if(type == 'anime') {
                        open.openAnime(update.id, update.episode, update.sub);
                    } else {
                        open.openManga(update.id, update.episode, update.sub);
                    }
                });
            };
        };

        ipc.on('new-anime-ep', displayNotification('anime'));
        ipc.on('new-manga-ep', displayNotification('manga'));
        ipc.on('new-message', (ev, message) => {
            notification.displayNotification(message.title, message.content, message.icon, () => {
                $state.go('message', { id: message.id });
            });
        });

        ipc.once('update', function(ev, release) {
            const yes = "UPDATE.YES";
            const no = "UPDATE.NO";
            const newVersion = "UPDATE.NEW_VERSION";
            const content = release.body.replace(/\r\n/g, "<br>");

            $translate([yes, no, newVersion]).then((translations) => {
                const dialog = $mdDialog.confirm()
                    .title(translations[newVersion])
                    .htmlContent("Version " + release.tag_name + " - " + release.name + "<br><br>" + content)
                    .ariaLabel("Update Notification")
                    .ok(translations[yes])
                    .cancel(translations[no]);
                $mdDialog.show(dialog).then(() => {
                    open.openLink(release.html_url);
                });
            });
        });

        const updateOnlineState = debounce((state) => {
            ipc.send('connectivity', state);
        }, 200);

        $window.addEventListener('online', () => {
            updateOnlineState(true);
        }, false);

        $window.addEventListener('offline', () => {
            updateOnlineState(false);
        }, false);
}]);
