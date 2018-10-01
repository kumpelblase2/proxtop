import createTemplate from './message-create.html';

angular.module('proxtop').controller('MessagesController', ['$scope', 'ipcManager', '$state', 'AvatarService', '$mdDialog', '$mdToast', '$translate', function($scope, ipcManager, $state, avatar, $mdDialog, $mdToast, translate) {
    const DialogController = ['$scope', '$mdDialog', function($scope, $mdDialog) {
        $scope.currentUser = "";
        $scope.participants = [];
        $scope.message = {
            title: null,
            text: ""
        };

        $scope.create = () => {
            $mdDialog.hide({
                participants: $scope.participants,
                title: $scope.message.title,
                text: $scope.message.text
            });
        };

        $scope.cancel = () => {
            $mdDialog.cancel();
        };
    }];
    
    const ipc = ipcManager($scope);
    $scope.conversations = null;
    $scope.hide_nonfavs = false;
    $scope.hover_id = -1;
    ipc.on('conversations', (ev, conversations) => {
        $scope.conversations = sortConversations(conversations);
    });

    $scope.openConversation = (conversation) => {
        $state.go('message', {
            id: conversation.id
        });
    };

    $scope.newConversation = (ev) => {
        const dialogScope = $scope.$new(true);
        dialogScope.limits = ipc.sendSync('message-constants');
        $mdDialog.show({
            controller: DialogController,
            template: createTemplate,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            scope: dialogScope
        }).then((answer) => {
            ipc.once('conversation-create', (ev, result) => {
                if(result.error == 0) {
                    $state.go('message', {
                        id: result.id
                    });
                } else {
                    translate('ERROR.MESSAGE_CREATE_ERROR').then((translation) => {
                        $mdToast.show($mdToast.simple().hideDelay(5000).textContent(translation));
                    });
                }
            });
            ipc.send('conversation-create', answer);
        });
    };

    $scope.toggleFavorite = (conversation, $event) => {
        $event.stopPropagation();
        const prefix = (conversation.favorite ? 'un' : '');
        const event = `conversation-${prefix}favorite`;
        ipc.send(event, conversation.id);
    };

    $scope.getLastMessageDate = getLatestMessageTimestamp;

    const toggleFav = (value) => {
        return (ev, result) => {
            for(let i = 0; i < $scope.conversations.length; i++) {
                if($scope.conversations[i].id == result.id) {
                    $scope.conversations[i].favorite = value;
                    return;
                }
            }
        };
    };

    ipc.on('conversation-favorite', toggleFav(true));
    ipc.on('conversation-unfavorite', toggleFav(false));

    $scope.getImage = avatar.getAvatarForID.bind(avatar);

    ipc.send('conversations');
}]);

function sortConversations(conversations) {
    return conversations.sort((a, b) => {
        // We do it the other way around compared to normal, so we already get a reversed array.
        // i.e. the lowest will be the newest.
        return getLatestMessageTimestamp(b) - getLatestMessageTimestamp(a);
    });
}

function getLatestMessageTimestamp(conversation) {
    const sortedTimestamps = conversation.messages.map(message => message.timestamp).sort();
    if(sortedTimestamps.length === 0) {
        return 0;
    }

    return sortedTimestamps[sortedTimestamps.length - 1] * 1000;
}
