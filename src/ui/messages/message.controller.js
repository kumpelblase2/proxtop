angular.module('proxtop').controller('MessageController', ['$scope', 'ipc', '$stateParams', function($scope, ipc, $stateParams) {
    $scope.messages = null;
    ipc.on('conversation', function(conversation) {
        $scope.$apply(function() {
            $scope.messages = conversation.reverse();
        });
    });

    $scope.getAvatar = function(image) {
        if(image == null || image == "") {
            return "";
        } else {
            return "https://cdn.proxer.me/avatar/tn/" + image;
        }
    };

    ipc.send('conversation', $stateParams.id);
}]);
