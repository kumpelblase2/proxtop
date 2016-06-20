angular.module('proxtop').controller('MenuController', ['$scope', 'ipcManager', '$state', '$mdSidenav', '$rootScope', 'session',
    function($scope, ipcManager, $state, $mdSidenav, $rootScope, session) {
        const ipc = ipcManager($scope);
        ipc.on('logout', (ev, data) => {
            if(data.success) {
                $state.go('main');
            } else {
                alert('Logout failed: ' + data.reason);
            }
        });

        $scope.toggleMenu = () => {
            $mdSidenav('left').toggle();
        };

        $scope.logout = () => {
            ipc.send('logout');
        };

        $scope.openAbout = () => {
            ipc.send('open-about');
        };

        $scope.isLoggedIn = () => {
            return session.isLoggedIn();
        };

        $scope.getUsername = () => {
            return session.getUser();
        };

        $rootScope.$on('$stateChangeSuccess', () => {
            $mdSidenav('left').close();
        });
}]);
