angular.module('proxtop').controller('BackgroundController', ['$scope', 'ipcManager', '$state', '$mdToast', '$translate', '$mdDialog', 'open', '$window', 'debounce',
    function($scope, ipcManager, $state, $mdToast, $translate, $mdDialog, open, $window, debounce) {
        const ipc = ipcManager($scope);
        ipc.on('error', (ev, severity, message) => {
            $mdToast.show($mdToast.simple().hideDelay(5000).textContent(severity + ':' + message));
        }, false);

        ipc.once('update', (ev, release) => {
            const yes = "UPDATE.YES";
            const no = "UPDATE.NO";
            const newVersion = "UPDATE.NEW_VERSION";
            const content = release.content.replace(/\r\n/g, "<br>");

            $translate([yes, no, newVersion]).then((translations) => {
                const dialog = $mdDialog.confirm()
                    .title(translations[newVersion])
                    .htmlContent("Version " + release.version + "<br><br>" + content)
                    .ariaLabel("Update Notification")
                    .ok(translations[yes])
                    .cancel(translations[no]);
                $mdDialog.show(dialog).then(() => {
                    if(release.success && release.success.type === 'open_url') {
                        open.openLink(release.success.value);
                    } else if(release.success && release.success.type === 'restart') {
                        ipc.send('install-update');
                    }
                });
            });
        }, false);

        ipc.on('state-change', (ev, state, params) => {
            $state.go(state, params);
        }, false);

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
