angular.module('proxtop').controller('SettingsController', ['$scope', 'settings', '$translate', 'ipc', function($scope, settings, $translate, ipc) {
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
    $scope.has_toggled = false;

    $scope.toggleRequestUpdate = function() {
        $scope.has_toggled = !$scope.has_toggled;
    };

    $scope.saveSettings = function() {
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

        if($scope.has_toggled) {
            ipc.send('reload-request');
            $scope.has_toggled = false;
        }
    };
}]);
