angular.module('proxtop').controller('BackgroundController', ['$scope', 'ipcManager', '$state', '$mdToast', '$translate', '$mdDialog', 'open', '$window', 'debounce',
    function($scope, ipcManager, $state, $mdToast, $translate, $mdDialog, open, $window, debounce) {
        const ipc = ipcManager($scope);
        ipc.on('error', (ev, severity, message) => {
            $mdToast.show($mdToast.simple().hideDelay(5000).textContent(severity + ':' + message));
        });

        ipc.once('update', (ev, release) => {
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

        ipc.on('state-change', (ev, state, params) => {
            $state.go(state, params);
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
