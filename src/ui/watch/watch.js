angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('watch', {
        url: '/watch/:id/:ep/:sub',
        templateUrl: 'ui/watch/watch.html',
        controller: 'WatchController'
    });
}]);
