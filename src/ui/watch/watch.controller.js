angular.module('proxtop').controller('WatchController', ['$scope', 'ipc' , '$stateParams', '$sce', function($scope, ipc, $stateParams, $sce) {
    ipc.on('watch', function(result) {
        $scope.$apply(function() {
            $scope.episode = result;
            var stream = _.find(result.streams, {type:'proxer-stream'});
            stream.url = $sce.trustAsResourceUrl(stream.replace.replace('#', stream.code));
            $scope.stream = stream;
        });
    });

    ipc.send('watch', $stateParams.id, $stateParams.ep, $stateParams.sub);
}]);
