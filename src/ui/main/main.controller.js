angular.module('proxtop').controller('MainController', ['$scope', 'ipc', '$state', function($scope, ipc, $state) {
    ipc.on('check-login', function(result) {
        if(result) {
            $state.go('profile');
        } else {
            $state.go('login');
        }
    });
    ipc.send('check-login');
}]);
