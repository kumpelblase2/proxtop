angular.module('proxtop').controller('ProfileController', ['$scope', 'ipc', '$state', function($scope, ipc, $state) {
    ipc.on('profile', function(profile) {
        $scope.$apply(function() {
            $scope.profile = profile;
        });
    });

    ipc.send('profile');
}]);
