angular.module('proxtop').controller('MessagesController', ['$scope', 'ipc', '$state', 'AvatarService', function($scope, ipc, $state, avatar) {
    $scope.conversations = null;
    ipc.once('conversations', function(ev, conversations) {
        $scope.$apply(function() {
            $scope.conversations = conversations;
        });
    });

    $scope.openConversation = function(conversation) {
        $state.go('message', {
            id: conversation.id
        });
    };

    $scope.getImage = avatar.getAvatarForID.bind(avatar);

    ipc.send('conversations');
}]);
