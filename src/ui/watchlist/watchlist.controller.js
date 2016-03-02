angular.module('proxtop').controller('WatchlistController', ['$scope', 'ipc', '$state', 'open', function($scope, ipc, $state, open) {
    $scope.watchlist = null;
    ipc.once('watchlist', function(ev, watchlist) {
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

    $scope.deleteEntry = function(entry) {
        ipc.send('delete-watchlist', entry.entry);
    };

    ipc.on('delete-watchlist', function(ev, result) {
        $scope.$apply(function() {
            var index = _.findIndex($scope.watchlist.anime, { entry: result.entry });
            if(index >= 0) {
                $scope.watchlist.anime.splice(index, 1);
            }

            index = _.findIndex($scope.watchlist.manga, { entry: result.entry });
            if(index >= 0) {
                $scope.watchlist.manga.splice(index, 1);
            }
        });
    });

    ipc.send('watchlist');
}]);
