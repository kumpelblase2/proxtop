angular.module('proxtop').controller('SettingsController', ['$scope', 'settings', '$translate', 'ipc', 'debounce', '$mdToast', function($scope, settings, $translate, ipc, debounce, $mdToast) {
    $scope.providers = [
        "Proxer-Stream",
        "Dailymotion",
        "MP4Upload",
        "videobam",
        "Crunchyroll",
        "YourUpload",
        "Daisuki.Net",
        "Viewster",
        "Faststream",
        "Hellsmedia",
        "Kiwi",
        "Myvi",
        "Novamov",
        "Veoh",
        "VideoWeed"
    ];

    $scope.settings = {
        anime: settings.get('anime'),
        account: settings.get('account'),
        watchlist: settings.get('watchlist'),
        general: settings.get('general')
    };
    $scope.header_updated = false;

    $scope.toggleRequestUpdate = () => {
        $scope.header_updated = !$scope.header_updated;
    };

    $scope.requestCacheClear = () => {
        ipc.send('clear-cache');
    };

    $scope.$watch((scope) => {
        return scope.settings;
    }, () => {
        $scope.saveSettings();
    }, true);

    $scope.saveSettings = debounce(() => {
        $translate.use($scope.settings.general.language);

        settings.set('account', {
            keep_login: $scope.settings.account.keep_login,
            store_password: $scope.settings.account.store_password,
            user: {
                username: $scope.settings.account.user.username,
                password: ($scope.settings.account.store_password ? $scope.settings.account.user.password : "")
            }
        });

        settings.set('anime', $scope.settings.anime);
        settings.set('watchlist', $scope.settings.watchlist);
        settings.set('general', $scope.settings.general);

        if($scope.header_updated) {
            ipc.send('reload-request');
            $scope.header_updated = false;
        }

        if($scope.settings.general.auto_update) {
            ipc.send('check-update');
        } else {
            ipc.send('stop-update');
        }

        $translate('SETTINGS.SAVED').then((saved) => {
            $mdToast.show($mdToast.simple().hideDelay(1500).textContent(saved));
        });
    }, 1000, false, true);
}]);
