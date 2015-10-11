angular.module('proxtop').controller('MessagesController', ['$scope', 'ipc', '$state', function($scope, ipc, $state) {
    ipc.on('conversations', function(conversations) {
        $scope.$apply(function() {
            $scope.conversations = conversations;
        });
    });

    $scope.openConversation = function(conversation) {
        $state.go('message', {
            id: conversation.id
        });
    };

    $scope.getImage = function(image) {
        if(image == null || image == "") {
            return "";
        } else {
            return "https://proxer.me/images/comprofiler/" + image;
        }
    };

    ipc.send('conversations');
}]);
