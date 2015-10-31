angular.module('proxtop').controller('SettingsController', ['$scope', 'settings', '$translate', function($scope, settings, $translate) {
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

    $scope.$watch(function(scope) {
        return scope.settings.general.language;
    }, function(newValue) {
        $translate.use(newValue);
    });

    $scope.saveSettings = function() {
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
    };
}]);
