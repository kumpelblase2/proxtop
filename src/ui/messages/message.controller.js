angular.module('proxtop').controller('MessageController', ['$scope', 'ipcManager', '$stateParams', 'AvatarService', '$interval', '$rootScope', '$mdDialog', '$translate', '$timeout', '$mdToast', function($scope, ipcManager, $stateParams, avatar, $interval, $rootScope, $mdDialog, $translate, $timeout, $mdToast) {
    const ReportController = ['$scope', '$mdDialog', function($scope, $mdDialog) {
        $scope.report = {
            text: ""
        };

        $scope.create = () => {
            $mdDialog.hide({
                text: $scope.report.text
            });
        };

        $scope.cancel = () => {
            $mdDialog.cancel();
        };
    }];


    const ipc = ipcManager($scope);
    const MESSAGE_UPDATE_DELAY = 1000;
    $scope.conversation = {};

    $scope.state = {
        message: "",
        sent: false,
        updateTimer: null,
        reported: false,
        markedRead: false
    };

    ipc.on('conversation', (ev, conversation) => {
        const hadLoaded = $scope.conversation && !!$scope.conversation.messages;
        const newMessages = hadLoaded && $scope.conversation.messages.length !== conversation.messages.length;
        $scope.conversation = conversation;
        if(!hadLoaded) {
            $scope.scrollToBottom();
        }

        if(newMessages) {
            $scope.markedRead = false;
        }
    });

    ipc.on('conversation-update', (ev, conversation) => {
        if($scope.conversation.messages) {
            Array.prototype.push.apply($scope.conversation.messages, conversation.messages);
        } else {
            $scope.conversation.messages = conversation.messages;
        }
    });

    $scope.getAvatar = (username) => {
        const participant = $scope.getParticipant(username);
        if(participant) {
            return avatar.getAvatarForID(participant.avatar);
        } else {
            return avatar.getDefaultAvatar();
        }
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
        ipc.send('conversation-update', $scope.conversation.id);
    };

    $scope.loadMore = () => {
        const page = $scope.conversation.last_page + 1;
        ipc.send('conversation-more', $scope.conversation.id, page);
    };

    $scope.report = (ev) => {
        const reportScope = $scope.$new(true);
        $mdDialog.show({
            controller: ReportController,
            templateUrl: 'ui/messages/message-report.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            scope: reportScope
        }).then((answer) => {
            ipc.once('conversation-report', (ev, result) => {
                $translate('MESSAGES.REPORT_SENT').then((translation) => {
                    $mdToast.show($mdToast.simple().hideDelay(5000).textContent(translation));
                });
            });

            ipc.send('conversation-report', $scope.conversation.id, answer.text);
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
        if($scope.conversation.id && !$scope.markedRead) {
            if(htmlElem.scrollTop + htmlElem.offsetHeight >= htmlElem.scrollHeight - htmlElem.scrollHeight * 0.02) {
                ipc.send('conversation-read', $scope.conversation.id);
                $scope.$apply(() => $scope.markedRead = true);
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
