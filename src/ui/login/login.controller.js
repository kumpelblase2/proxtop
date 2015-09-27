angular.module('proxtop').controller('LoginController', ['$scope', 'settings', 'ipc', function($scope, settings, ipc) {
    ipc.on('login', function(result) {
        if(result.success) {
            console.log('LOGGED IN');
        } else {
            console.log('COULD NOT LOGIN - ' + result.reason);
        }
    });

    var loaded = _.omit(settings.get('account'), 'type');

    $scope.login = function() {
        var newSettings = loaded;
        newSettings.user = $scope.user;
        newSettings.keep_login = $scope.keepLogin;
        newSettings.store_password = $scope.storePassword;
        settings.set('account', newSettings);
        ipc.send('login', $scope.user, $scope.keepLogin);
    };

    $scope.user = loaded.user;
    $scope.keepLogin = loaded.keep_login;
    $scope.storePassword = loaded.store_password;
}]);
