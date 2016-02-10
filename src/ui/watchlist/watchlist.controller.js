angular.module('proxtop').controller('WatchlistController', ['$scope', 'ipc', '$state', 'open', function($scope, ipc, $state, open) {
    $scope.watchlist = null;
    ipc.on('watchlist', function(watchlist) {
        $scope.$apply(function() {
            $scope.watchlist = watchlist;
        });
    });

    $scope.clickAnime = function(entry) {
        open.openAnime(entry.id, entry.episode, entry.sub);
    };

    $scope.clickManga = function(entry) {
       open.openManga(entry.id, entry.episode, entry.sub);
    };

    ipc.send('watchlist');
}]);
