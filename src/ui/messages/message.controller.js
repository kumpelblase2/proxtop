angular.module('proxtop').controller('MessageController', ['$scope', 'ipcManager', '$stateParams', 'AvatarService', '$interval', '$rootScope', '$mdDialog', '$translate', '$timeout', function($scope, ipcManager, $stateParams, avatar, $interval, $rootScope, $mdDialog, $translate, $timeout) {
    const ipc = ipcManager($scope);
    const MESSAGE_UPDATE_DELAY = 15000;

    $scope.conversation = {};
    $scope.state = {
        message: "",
        sent: false,
        updateTimer: null,
        reported: false
    };

    ipc.on('conversation', (ev, conversation) => {
        $scope.conversation = conversation;
        $scope.scrollToBottom();
    });

    ipc.on('conversation-update', (ev, conversation) => {
        if($scope.conversation.messages) {
            Array.prototype.push.apply($scope.conversation.messages, conversation.messages);
        } else {
            $scope.conversation.messages = conversation.messages;
        }
    });

    $scope.getAvatar = (username) => {
        return avatar.getAvatarForID($scope.getParticipant(username).avatar);
    };

    $scope.getParticipant = (username) => {
        return $scope.conversation.participants.filter((part) => part.username === username)[0];
    };

    $scope.sendMessage = () => {
        if($scope.state.message.length > 0 && !$scope.state.sent) {
            ipc.once('conversation-write', (event, result) => {
                $scope.state.message = "";
                $scope.state.sent = false;

                if(result != null && result.length > 0) {
                    alert(result); //TODO
                } else {
                    ipc.send('conversation-update', $scope.conversation.id);
                }
            });
            $scope.state.sent = true;
            ipc.send('conversation-write', $scope.conversation.id, $scope.state.message);
        }
    };

    $scope.updateMessages = () => {
        console.log("updating messages - " + $scope.conversation.id);
        ipc.send('conversation-update', $scope.conversation.id);
    };

    $scope.loadMore = () => {
        const page = $scope.conversation.last_page + 1;
        ipc.send('conversation-more', $scope.conversation.id, page);
    };

    $scope.report = (ev) => {
        const sure = "GENERAL.ARE_YOU_SURE";
        const title = "MESSAGES.REPORT";
        const yes = "GENERAL.YES";
        const no = "GENERAL.NO";
        $translate([sure, title, yes, no]).then((translations) => {
            const confirm = $mdDialog.confirm()
                      .title(translations[title] + "?")
                      .textContent(translations[sure])
                      .ariaLabel(translations[title])
                      .targetEvent(ev)
                      .ok(translations[yes])
                      .cancel(translations[no]);
            $mdDialog.show(confirm).then(() => {
                ipc.send('conversation-report', $scope.conversation.id);
                $scope.state.reported = true;
            }, () => {});
        });
    };

    $scope.toggleFavorite = () => {
        const prefix = $scope.conversation.favorite ? "un" : '';
        const eventName = `conversation-${prefix}favorite`;
        ipc.once(eventName, () => {
            $scope.conversation.favorite = !$scope.conversation.favorite;
        });

        ipc.send(eventName, $scope.conversation.id);
    };

    $scope.toggleBlock = () => {
        const prefix = $scope.conversation.blocked ? "un" : '';
        const eventName = `conversation-${prefix}block`;
        ipc.once(eventName, () => {
            $scope.conversation.blocked = !$scope.conversation.blocked;
        });

        ipc.send(eventName, $scope.conversation.id);
    };

    $scope.scrollToBottom = () => {
        $timeout(() => {
            const list = document.getElementById("messages-view");
            list.scrollTop = list.scrollHeight;
        });
    };

    $scope.parseTimestamp = (timestamp) => {
        try {
            const intTimestamp = parseInt(timestamp);
            return intTimestamp * 1000;
        } catch(e) {
            return 0;
        }
    };

    $scope.checkMarkRead = (elem) => {
        const htmlElem = elem[0];
        if($scope.conversation.id) {
            if(htmlElem.scrollTop + htmlElem.offsetHeight >= htmlElem.scrollHeight - htmlElem.scrollHeight * 0.02) {
                ipc.send('conversation-read', $scope.conversation.id);
                console.log('marking conversation read');
            }
        }
    };

    ipc.send('conversation', $stateParams.id);
    $scope.state.updateTimer = $interval(() => { $scope.updateMessages(); }, MESSAGE_UPDATE_DELAY);

    $scope.$on('$destroy', () => {
        $interval.cancel($scope.state.updateTimer);
    });
}]);
