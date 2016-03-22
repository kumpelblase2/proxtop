angular.module('proxtop').controller('LoginController', ['$scope', 'settings', 'ipc', '$state', '$mdToast', '$rootScope', function($scope, settings, ipc, $state, $mdToast, $rootScope) {
    var loggedIn = false;
    ipc.on('login', function(ev, result) {
        if(result.success) {
            loggedIn = true;
            console.log('LOGGED IN');
            ipc.send('watchlist-update');
            $state.go('profile');
        } else {
            console.log('COULD NOT LOGIN - ' + result.reason);
            $mdToast.show($mdToast.simple().textContent('Could not login: ' + result.reason));
        }
    });

    $rootScope.$on('$stateChangeStart', function(event, toState) {
        if (toState.name !== 'login' && !loggedIn) {
            event.preventDefault();
            $state.go('login');
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
