import template from './login.html';

angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('login', {
        url: '/login',
        template: template,
        controller: 'LoginController'
    });
}]);
