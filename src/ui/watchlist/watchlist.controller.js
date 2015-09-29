angular.module('proxtop').controller('WatchlistController', ['$scope', 'ipc', '$state', function($scope, ipc, $state) {
    ipc.on('watchlist', function(watchlist) {
        $scope.$apply(function() {
            $scope.watchlist = watchlist;
        });
    });

    ipc.send('watchlist');
}]);
