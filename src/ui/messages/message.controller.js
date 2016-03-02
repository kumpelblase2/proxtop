angular.module('proxtop').controller('MessageController', ['$scope', 'ipc', '$stateParams', function($scope, ipc, $stateParams) {
    $scope.messages = null;
    $scope.input = { message: "", sent: false };
    ipc.once('conversation', function(ev, conversation) {
        $scope.$apply(function() {
            $scope.messages = conversation.reverse();
        });
    });

    ipc.on('conversation-update', function(ev, conversation) {
        $scope.$apply(function() {
            $scope.messages = conversation.messages;
        });
    });

    $scope.getAvatar = function(image) {
        if(image == null || image == "") {
            return "";
        } else {
            return "https://cdn.proxer.me/avatar/tn/" + image;
        }
    };

    $scope.sendMessage = function() {
        if($scope.input.message.length > 0 && !$scope.input.sent) {
            ipc.once('conversation-write', function(event, result) {
                $scope.$apply(function() {
                    $scope.input.message = "";
                    $scope.input.sent = false;
                });
            });
            $scope.input.sent = true;
            ipc.send('conversation-write', $stateParams.id, $scope.input.message);
            ipc.send('conversation-update', $stateParams.id);
        }
    }

    ipc.send('conversation', $stateParams.id);
}]);
