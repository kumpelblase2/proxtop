angular.module('proxtop').controller('MainController', ['$scope', 'ipc', '$state', function($scope, ipc, $state) {
    ipc.on('check-login', function(result) {
        if(result) {
            $state.go('profile');
        } else {
            $state.go('login');
        }
    });

    ipc.on('error', function(severity, message) {
        //alert(severity, message);
    })
    ipc.send('check-login');
}]);
