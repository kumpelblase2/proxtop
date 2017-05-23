angular.module('proxtop').controller('LoginController', ['$scope', 'settings', 'ipcManager', '$state', '$mdToast', '$rootScope', '$mdDialog', '$translate', function($scope, settings, ipcManager, $state, $mdToast, $rootScope, $mdDialog, $translate) {
    let loggedIn = false;
    const ipc = ipcManager($scope);
    ipc.on('login', (ev, result) => {
        if(result.success) {
            loggedIn = true;
            ipc.send('watchlist-update');
            $state.go('profile');
        } else if(result.reason === '2fa_enabled') {
            $scope.open2FARequest();
        } else {
            $mdToast.show($mdToast.simple().textContent('Could not login: ' + result.reason));
        }
    });

    $rootScope.$on('$stateChangeStart', (event, toState) => {
        if (toState.name !== 'login' && !loggedIn) {
            event.preventDefault();
            $state.go('login');
        }
    });

    $scope.open2FARequest = function() {
        $translate(['LOGIN.LOGIN', 'GENERAL.CANCEL', 'LOGIN.2FA_REQUIRED', 'LOGIN.2FA_TOKEN']).then((translation) => {
            const confirm = $mdDialog.prompt()
                .title(translation['LOGIN.2FA_REQUIRED'])
                .textContent(translation['LOGIN.2FA_TOKEN'])
                .ariaLabel(translation['LOGIN.2FA_TOKEN'])
                .ok(translation['LOGIN.LOGIN'])
                .cancel(translation['LOGIN.CANCEL']);

            $mdDialog.show(confirm).then((result) => {
                $scope.secondFactor = result;
                $scope.login();
            });
        });
    };

    $scope.login = function() {
        settings.set('account', {
            keep_login: $scope.keepLogin,
            store_password: $scope.storePassword,
            user: {
                username: $scope.user.username,
                password: ($scope.storePassword ? $scope.user.password : "")
            }
        });
        ipc.send('login', $scope.user, $scope.secondFactor);
    };

    const loaded = _.omit(settings.get('account'), 'type');
    $scope.user = loaded.user;
    $scope.secondFactor = null;
    $scope.keepLogin = loaded.keep_login;
    $scope.storePassword = loaded.store_password;
}]);
