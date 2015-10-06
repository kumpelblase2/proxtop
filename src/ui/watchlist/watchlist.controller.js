angular.module('proxtop').controller('WatchlistController', ['$scope', 'ipc', '$state', function($scope, ipc, $state) {
    ipc.on('watchlist', function(watchlist) {
        $scope.$apply(function() {
            $scope.watchlist = watchlist;
        });
    });

    $scope.clickWatchlistEntry = function(entry) {
        require('shell').openExternal('https://proxer.me' + entry.url);
    };

    ipc.send('watchlist');
}]);
