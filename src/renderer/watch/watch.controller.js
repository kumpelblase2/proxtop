import _ from 'lodash';

angular.module('proxtop').controller('WatchController', ['$scope', 'ipcManager', '$stateParams', '$sce', 'settings', '$state', '$mdToast', '$translate', 'SupportedProviderService', '$interval', function($scope, ipcManager, $stateParams, $sce, settings, $state, $mdToast, $translate, SupportedProviderService, $interval) {
    const ipc = ipcManager($scope);
    $scope.current = {
        info: null,
        stream: null,
        video: null,
        canPlay: false,
        markedNext: false
    };

    const animeSettings = settings.get('anime');
    const preferredStream = animeSettings.preferred_stream;
    const playExternal = animeSettings.open_with === 'external';
    const passRaw = animeSettings.pass_raw_url;
    const markNext = animeSettings.mark_next_episode;
    const markNextPercent = animeSettings.mark_next_episode_percent;
    const autostartNext = animeSettings.automatically_start_next;
    const timeBeforeNext = animeSettings.time_before_next;

    $scope.displayTimer = false;
    $scope.remainingTimeTillNext = timeBeforeNext;
    let timerRunnable = null;

    $scope.current.display = !playExternal;

    ipc.once('episode', (ev, result) => {
        $scope.current.info = result;
        const supported = _.filter($scope.current.info.streams, SupportedProviderService.isSupported);
        $scope.current.info.streams = supported;
        if(supported && supported.length === 0) {
            $translate('ERROR.NO_STREAM_AVAILABLE').then((translation) => {
                $mdToast.show($mdToast.simple().textContent(translation));
                $state.go('watchlist');
            });
        } else if(supported && supported.length === 1) {
            $scope.select(supported[0]);
        } else {
            const found = _.filter(supported, { type: preferredStream });
            if(found && found[0]) {
                $scope.select(found[0]);
            }
        }
    });

    $scope.select = (stream) => {
        $scope.current.stream = stream;
        $scope.current.canPlay = false;
        ipc.send('watch', stream);
    };

    ipc.once('watch', (ev, video) => {
        if(video) {
            const actualUrl = video.url;
            video.url = $sce.trustAsResourceUrl(video.url);
            $scope.current.video = video;
            if(playExternal && passRaw) {
                ipc.send('open-external', actualUrl);
            }
        } else {
            $state.go('watchlist');
        }
    });

    $scope.updateTime = (currentTime, totalTime) => {
        if(markNext && $scope.hasNext() && !$scope.current.markedNext && currentTime / totalTime >= markNextPercent / 100) {
            console.debug("Marking next episode since we passed the watch percentage.");
            $scope.markedNext = true;
            $scope.addNextToWatchlist();
        }

        if(autostartNext && totalTime - currentTime <= timeBeforeNext && !$scope.displayTimer) {
            $scope.startTimerForNext();
        }
    };

    $scope.hasVideo = () => {
        return $scope.current.video && $scope.current.video.type === 'mp4';
    };

    $scope.isReadyForPlayback = () => {
        return $scope.hasVideo() && $scope.current.canPlay;
    };

    $scope.shouldShowControls = () => {
        return $scope.current.stream && ($scope.hasVideo() || playExternal);
    };

    $scope.previous = () => {
        if($scope.hasPrevious()) {
            $state.go('watch', {
                id: $stateParams.id,
                ep: $scope.current.info.prev,
                sub: $stateParams.sub
            });
        }
    };

    $scope.hasPrevious = () => {
        return $scope.current.info && $scope.current.info.prev;
    };

    $scope.next = () => {
        if($scope.hasNext()) {
            $state.go('watch', {
                id: $stateParams.id,
                ep: $scope.current.info.next,
                sub: $stateParams.sub
            });
        }
    };

    $scope.hasNext = () => {
        return $scope.current.info && $scope.current.info.next;
    };

    // We have to pass over 'anime' below as it's expecting a category. Since we currently only support viewing anime and not manga, this can be static
    $scope.addToWatchlist = () => {
        ipc.send('add-watchlist', 'anime', $stateParams.id, $stateParams.ep, $stateParams.sub);
    };

    $scope.addNextToWatchlist = () => {
        ipc.send('add-watchlist', 'anime', $stateParams.id, $scope.current.info.next, $stateParams.sub);
    };

    $scope.finishWatching = () => {
        ipc.send('finish-watchlist', 'anime', $stateParams.id, $stateParams.ep, $stateParams.sub);
    };

    $scope.timerPercentage = () => {
        return 100 - ($scope.remainingTimeTillNext / timeBeforeNext) * 100;
    };

    $scope.startTimerForNext = () => {
        if(timeBeforeNext === 0) {
            $scope.next();
        }

        $scope.displayTimer = true;
        timerRunnable = $interval(() => {
            $scope.remainingTimeTillNext -= 1;
            if($scope.remainingTimeTillNext <= 0) {
                $scope.next();
                $interval.cancel(timerRunnable);
            }
        }, 1000);
    };

    $scope.cancelAutostart = () => {
        $interval.cancel(timerRunnable);
        $scope.displayTimer = false;
    };

    ipc.on('add-watchlist', (ev, response) => {
        $translate('WATCHLIST.UPDATE_FINISHED').then(function(translation) {
            $mdToast.show($mdToast.simple().textContent(translation));
        });
    });

    ipc.on('finish-watchlist', (ev, response) => {
        $translate('WATCHLIST.MARKED_FINISHED').then(function(translation) {
            $mdToast.show($mdToast.simple().textContent(translation));
        });
    });

    ipc.send('episode', $stateParams.id, $stateParams.ep, $stateParams.sub);

    $scope.$on('$destroy', () => {
        $interval.cancel(timerRunnable);
    });
}]);
