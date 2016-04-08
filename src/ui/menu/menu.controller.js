angular.module('proxtop').controller('MenuController', ['$scope', 'ipc', '$state', '$mdSidenav', function($scope, ipc, $state, $mdSidenav) {
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
}]);
