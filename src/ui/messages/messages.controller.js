angular.module('proxtop').controller('MessagesController', ['$scope', 'ipc', '$state', 'AvatarService', function($scope, ipc, $state, avatar) {
    $scope.conversations = null;
    $scope.hide_nonfavs = false;
    ipc.once('conversations', function(ev, conversations) {
        ipc.send('conversations-favorites');
        $scope.$apply(function() {
            $scope.conversations = conversations;
        });
    });

    ipc.once('conversations-favorites', function(ev, favorites) {
        const ids = favorites.map((fav) => fav.id);
        $scope.$apply(function() {
            $scope.conversations = $scope.conversations.map(function(conv) {
                conv.favorite = ids.includes(conv.id);
                return conv;
            });
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
