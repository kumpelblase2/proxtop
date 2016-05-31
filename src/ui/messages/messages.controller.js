angular.module('proxtop').controller('MessagesController', ['$scope', 'ipcManager', '$state', 'AvatarService', function($scope, ipcManager, $state, avatar) {
    const ipc = ipcManager($scope);
    $scope.conversations = null;
    $scope.hide_nonfavs = false;
    $scope.hover_id = -1;
    ipc.once('conversations', (ev, conversations) => {
        ipc.send('conversations-favorites');
        $scope.$apply(function() {
            $scope.conversations = conversations;
        });
    });

    ipc.once('conversations-favorites', (ev, favorites) => {
        const ids = favorites.map((fav) => fav.id);
        $scope.$apply(function() {
            $scope.conversations = $scope.conversations.map(function(conv) {
                conv.favorite = ids.includes(conv.id);
                return conv;
            });
        });
    });

    $scope.openConversation = (conversation) => {
        $state.go('message', {
            id: conversation.id
        });
    };

    $scope.toggleFavorite = (conversation, $event) => {
        $event.stopPropagation();
        const prefix = (conversation.favorite ? 'un' : '');
        const event = `conversation-${prefix}favorite`;
        ipc.send(event, conversation.id);
    };

    const toggleFav = (value) => {
        return (ev, result) => {
            $scope.$apply(() => {
                for(var i = 0; i < $scope.conversations.length; i++) {
                    if($scope.conversations[i].id == result.id) {
                        $scope.conversations[i].favorite = value;
                        return;
                    }
                }
            });
        };
    };

    ipc.on('conversation-favorite', toggleFav(true));
    ipc.on('conversation-unfavorite', toggleFav(false));

    $scope.getImage = avatar.getAvatarForID.bind(avatar);

    ipc.send('conversations');
}]);
