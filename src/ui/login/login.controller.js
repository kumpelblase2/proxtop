angular.module('proxtop').controller('LoginController', ['$scope', 'settings', 'ipc', '$state', '$mdToast', function($scope, settings, ipc, $state, $mdToast) {
    ipc.on('login', function(result) {
        if(result.success) {
            console.log('LOGGED IN');
            $state.go('profile');
        } else {
            console.log('COULD NOT LOGIN - ' + result.reason);
            $mdToast.show($mdToast.simple().content('Could not login: ' + result.reason));
        }
    });

    var loaded = _.omit(settings.get('account'), 'type');

    $scope.login = function() {
        settings.set('account', {
            keep_login: $scope.keepLogin,
            store_password: $scope.storePassword,
            user: {
                username: $scope.user.username,
                password: ($scope.storePassword ? $scope.user.password : "")
            }
        });
        ipc.send('login', $scope.user, $scope.keepLogin);
    };

    $scope.user = loaded.user;
    $scope.keepLogin = loaded.keep_login;
    $scope.storePassword = loaded.store_password;
}]);
