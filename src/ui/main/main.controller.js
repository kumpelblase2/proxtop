angular.module('proxtop').controller('MainController', ['$scope', 'ipcManager', '$state', 'notification', '$mdToast', '$translate', 'settings', '$mdDialog', 'open', '$window', 'debounce',
    function($scope, ipcManager, $state, notification, $mdToast, $translate, settings, $mdDialog, open, $window, debounce) {
        const ipc = ipcManager($scope);
        ipc.once('check-login', function(ev, result) {
            if(result) {
                ipc.send('watchlist-update');
                $state.go('profile');
            } else {
                $state.go('login');
            }
        });

        $translate.use(settings.get('general').language);
        ipc.send('check-login');
}]);
