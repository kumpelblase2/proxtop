angular.module('proxtop').controller('MenuController', ['$scope', 'ipc', '$state', '$mdSidenav', '$rootScope', function($scope, ipc, $state, $mdSidenav, $rootScope) {
    ipc.setup($scope);
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
