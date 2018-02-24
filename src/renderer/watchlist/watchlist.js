import template from './watchlist.html';

angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('watchlist', {
        url: '/watchlist',
        template: template,
        controller: 'WatchlistController'
    });
}]);
