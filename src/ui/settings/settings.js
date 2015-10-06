angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('settings', {
        url: '/settings',
        templateUrl: 'ui/settings/settings.html',
        controller: 'SettingsController'
    });
}]);
