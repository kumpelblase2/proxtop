import template from './main.html';

angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('main', {
        url: '/',
        template: template,
        controller: 'MainController'
    });
}]);
