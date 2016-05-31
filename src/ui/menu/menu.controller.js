angular.module('proxtop').controller('MenuController', ['$scope', 'ipcManager', '$state', '$mdSidenav', '$rootScope', function($scope, ipcManager, $state, $mdSidenav, $rootScope) {
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

    $rootScope.$on('$stateChangeSuccess', () => {
        $mdSidenav('left').close();
    });
}]);
