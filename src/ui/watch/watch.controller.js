angular.module('proxtop').controller('WatchController', ['$scope', 'ipc' , '$stateParams', '$sce', 'settings', '$state', function($scope, ipc, $stateParams, $sce, settings, $state) {
    $scope.current = {
        info: null,
        stream: null,
        video: null,
        canPlay: false
    };
    var preferredStream = settings.get('anime').preferred_stream;

    ipc.on('streams', function(result) {
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

    ipc.on('watch', function(video) {
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
        $state.go('watch', {
            id: $stateParams.id,
            ep: parseInt($stateParams.ep) - 1,
            sub: $stateParams.sub
        });
    };

    $scope.next = function() {
        $state.go('watch', {
            id: $stateParams.id,
            ep: parseInt($stateParams.ep) + 1,
            sub: $stateParams.sub
        });
    };

    ipc.send('streams', $stateParams.id, $stateParams.ep, $stateParams.sub);
}]);
