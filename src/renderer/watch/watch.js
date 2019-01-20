import template from './watch.html';

angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('watch', {
        url: '/watch/:id/:ep/:sub/:entry',
        template: template,
        controller: 'WatchController'
    });
}]);
