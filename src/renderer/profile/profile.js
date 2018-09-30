import template from './profile.html';

angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('profile', {
        url: '/profile',
        template: template,
        controller: 'ProfileController'
    });
}]);
