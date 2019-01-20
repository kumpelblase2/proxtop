import _ from 'lodash';

angular.module('proxtop').controller('WatchlistController', ['$scope', 'ipcManager', '$state', 'open', function($scope, ipcManager, $state, open) {
    const ipc = ipcManager($scope);
    $scope.watchlist = null;
    ipc.once('watchlist', (ev, watchlist) => {
        $scope.watchlist = watchlist;
    });

    $scope.clickAnime = function(entry) {
        open.openAnime(entry.id, entry.episode, entry.sub, entry.entry);
    };

    $scope.clickManga = function(entry) {
        open.openManga(entry.id, entry.episode, entry.sub, entry.entry);
    };

    $scope.deleteEntry = function(entry) {
        ipc.send('delete-watchlist', entry.entry);
    };

    ipc.on('delete-watchlist', function(ev, result) {
        let index = _.findIndex($scope.watchlist.anime, { entry: result.entry });
        if(index >= 0) {
            $scope.watchlist.anime.splice(index, 1);
        }

        index = _.findIndex($scope.watchlist.manga, { entry: result.entry });
        if(index >= 0) {
            $scope.watchlist.manga.splice(index, 1);
        }
    });

    ipc.send('watchlist');
}]);
