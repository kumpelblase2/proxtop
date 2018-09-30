import template from './settings.html';

angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('settings', {
        url: '/settings',
        template: template,
        controller: 'SettingsController'
    });
}]);
