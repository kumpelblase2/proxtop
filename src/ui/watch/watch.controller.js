angular.module('proxtop').controller('WatchController', ['$scope', 'ipc' , '$stateParams', '$sce', function($scope, ipc, $stateParams, $sce) {
    ipc.on('streams', function(result) {
        ipc.send('watch', _.find(result.streams, {type:'proxer-stream'}));
    });

    ipc.on('watch', function(video) {
        $scope.$apply(function() {
            video.url = $sce.trustAsResourceUrl(video.url);
            $scope.video = video;
        });
    });

    ipc.send('streams', $stateParams.id, $stateParams.ep, $stateParams.sub);
}]);
