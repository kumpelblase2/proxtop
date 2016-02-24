angular.module('proxtop').controller('WatchController', ['$scope', 'ipc' , '$stateParams', '$sce', 'settings', '$state', '$mdToast', '$translate', function($scope, ipc, $stateParams, $sce, settings, $state, $mdToast, $translate) {
    $scope.current = {
        info: null,
        stream: null,
        video: null,
        canPlay: false
    };
    var preferredStream = settings.get('anime').preferred_stream;

    ipc.on('episode', function(ev, result) {
        $scope.$apply(function() {
            $scope.current.info = result;
            var found = _.filter($scope.current.info.streams, { type: preferredStream });
            if(found && found[0]) {
                $scope.select(found[0]);
            }
        });
    });

    $scope.select = function(stream) {
        $scope.current.stream = stream;
        $scope.current.canPlay = false;
        ipc.send('watch', stream);
    };

    ipc.on('watch', function(ev, video) {
        $scope.$apply(function() {
            video.url = $sce.trustAsResourceUrl(video.url);
            $scope.current.video = video;
        });
    });

    $scope.hasVideo = function() {
        return $scope.current.video && $scope.current.video.type == 'mp4';
    };

    $scope.isReadyForPlayback = function() {
        return $scope.hasVideo() && $scope.current.canPlay;
    };

    $scope.previous = function() {
        if($scope.hasPrevious()) {
            $state.go('watch', {
                id: $stateParams.id,
                ep: $scope.current.info.prev,
                sub: $stateParams.sub
            });
        }
    };

    $scope.hasPrevious = function() {
        return $scope.current.info && $scope.current.info.prev;
    };

    $scope.next = function() {
        if($scope.hasNext()) {
            $state.go('watch', {
                id: $stateParams.id,
                ep: $scope.current.info.next,
                sub: $stateParams.sub
            });
        }
    };

    $scope.hasNext = function() {
        return $scope.current.info && $scope.current.info.next;
    };

    $scope.addToWatchlist = function() {
        ipc.send('add-watchlist', $stateParams.id, $stateParams.ep, $stateParams.sub);
    };

    $scope.addNextToWatchlist = function() {
        ipc.send('add-watchlist', $stateParams.id, $scope.current.info.next, $stateParams.sub);
    };

    $scope.finishWatching = function() {
        ipc.send('finish-watchlist', $stateParams.id, $stateParams.ep, $stateParams.sub);
    };

    ipc.on('add-watchlist', function(ev, response) {
        $translate('WATCHLIST.UPDATE_FINISHED').then(function(translation) {
            $mdToast.show($mdToast.simple().textContent(translation));
        });
    });

    ipc.on('finish-watchlist', function(ev, response) {
        $translate('WATCHLIST.MARKED_FINISHED').then(function(translation) {
            $mdToast.show($mdToast.simple().textContent(translation));
        });
    });

    ipc.send('episode', $stateParams.id, $stateParams.ep, $stateParams.sub);
}]);
