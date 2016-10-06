angular.module('proxtop').controller('MessageController', ['$scope', 'ipcManager', '$stateParams', 'AvatarService', '$interval', '$rootScope', '$mdDialog', '$translate', '$timeout', function($scope, ipcManager, $stateParams, avatar, $interval, $rootScope, $mdDialog, $translate, $timeout) {
    const ipc = ipcManager($scope);
    const MESSAGE_UPDATE_DELAY = 15000;

    $scope.conversation = {};
    $scope.state = {
        message: "",
        sent: false,
        lastReceived: 0,
        updateTimer: null,
        reported: false
    };

    ipc.on('conversation', (ev, conversation) => {
        $scope.conversation = conversation;
        $scope.conversation.messages = _.sortBy(conversation.messages, (m) => { return parseInt(m.id); });
        $scope.refreshLast();
        $scope.scrollToBottom();
    });

    ipc.on('conversation-update', (ev, conversation) => {
        if($scope.conversation.messages) {
            Array.prototype.push.apply($scope.conversation.messages, conversation.messages);
        } else {
            $scope.conversation.messages = conversation.messages;
        }
        $scope.refreshLast();
    });

    $scope.getAvatar = avatar.getAvatarForID.bind(avatar);

    $scope.sendMessage = () => {
        if($scope.state.message.length > 0 && !$scope.state.sent) {
            ipc.once('conversation-write', (event, result) => {
                $scope.state.message = "";
                $scope.state.sent = false;
            });
            $scope.state.sent = true;
            ipc.send('conversation-write', $stateParams.id, $scope.state.message);
            ipc.send('conversation-update', $stateParams.id, $scope.state.lastReceived);
        }
    };

    $scope.updateMessages = () => {
        console.log("updating messages - " + $scope.state.lastReceived);
        ipc.send('conversation-update', $stateParams.id, $scope.state.lastReceived);
    };

    $scope.refreshLast = () => {
        const last = _.last($scope.conversation.messages);
        $scope.state.lastReceived = (last ? last.id : 0);
    };

    $scope.loadMore = () => {
        const page = $scope.conversation.last_page + 1;
        ipc.send('conversation-more', $stateParams.id, page);
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
                ipc.send('conversation-report', $stateParams.id);
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

        ipc.send(eventName, $stateParams.id);
    };

    $scope.toggleBlock = () => {
        const prefix = $scope.conversation.blocked ? "un" : '';
        const eventName = `conversation-${prefix}block`;
        ipc.once(eventName, () => {
            $scope.conversation.blocked = !$scope.conversation.blocked;
        });

        ipc.send(eventName, $stateParams.id);
    };

    $scope.scrollToBottom = () => {
        $timeout(() => {
            const list = document.getElementById("messages-view");
            list.scrollTop = list.scrollHeight;
        });
    };

    ipc.send('conversation', $stateParams.id);
    $scope.state.updateTimer = $interval(() => { $scope.updateMessages(); }, MESSAGE_UPDATE_DELAY);

    $scope.$on('$destroy', () => {
        $interval.cancel($scope.state.updateTimer);
    });
}]);
