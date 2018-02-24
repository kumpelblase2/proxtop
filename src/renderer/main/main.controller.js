angular.module('proxtop').controller('MainController', ['$scope', 'ipc', '$state', '$mdToast', '$translate', 'settings', 'session',
    function($scope, ipc, $state, $mdToast, $translate, settings, session) {
        session.onLogin(() => {
            ipc.send('watchlist-update');
            $state.go('profile');
        }, () => {
            $state.go('login');
        });

        $translate.use(settings.get('general').language);
        session.checkLogin();
}]);
