angular.module('proxtop').controller('LoginController', ['$scope', 'settings', 'ipc', function($scope, settings, ipc) {
    ipc.on('login', function(result) {
        if(result.success) {
            console.log('LOGGED IN');
        } else {
            console.log('COULD NOT LOGIN - ' + result.reason);
        }
    });

    var loaded = settings.get();

    $scope.login = function() {
        var newSettings = loaded;
        newSettings.user = $scope.user;
        newSettings.store_password = $scope.keepLogin;
        ipc.send('settings', 'set', newSettings);
        ipc.send('login', $scope.user, $scope.keepLogin);
    };

    $scope.user = loaded.user;
    $scope.keepLogin = loaded.store_password;
}]);
