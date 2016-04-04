angular.module('proxtop').controller('MenuController', ['$scope', 'ipc', '$state', '$mdSidenav', function($scope, ipc, $state, $mdSidenav) {
    ipc.on('logout', function(ev, data) {
        if(data.success) {
            $state.go('main');
        } else {
            alert('Logout failed: ' + data.reason);
        }
    });

    $scope.toggleMenu = function() {
        $mdSidenav('left').toggle();
    }

    $scope.logout = function() {
        ipc.send('logout');
    }
}]);
