angular.module('proxtop').controller('MenuController', ['$scope', 'ipc', '$state', function($scope, ipc, $state) {
    ipc.on('logout', function(data) {
        if(data.success) {
            $state.go('main');
        } else {
            alert('Logout failed: ' + data.reason);
        }
    });

    $scope.logout = function() {
        ipc.send('logout');
    }
}]);
