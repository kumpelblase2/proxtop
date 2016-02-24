angular.module('proxtop').controller('MessagesController', ['$scope', 'ipc', '$state', function($scope, ipc, $state) {
    $scope.conversations = null;
    ipc.on('conversations', function(ev, conversations) {
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
            return "https://cdn.proxer.me/avatar/tn/" + image;
        }
    };

    ipc.send('conversations');
}]);
