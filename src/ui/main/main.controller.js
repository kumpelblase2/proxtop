angular.module('proxtop').controller('MainController', ['$scope', 'ipcManager', '$state', '$mdToast', '$translate', 'settings',
    function($scope, ipcManager, $state, $mdToast, $translate, settings) {
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
