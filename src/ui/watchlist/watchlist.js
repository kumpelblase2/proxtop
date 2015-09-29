angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('watchlist', {
        url: '/watchlist',
        templateUrl: 'ui/watchlist/watchlist.html',
        controller: 'WatchlistController'
    });
}]);
