angular.module('proxtop').controller('MessageController', ['$scope', 'ipc', '$stateParams', 'AvatarService', '$interval', '$rootScope', function($scope, ipc, $stateParams, avatar, $interval, $rootScope) {
    var MESSAGE_UPDATE_DELAY = 15000;

    $scope.conversation = {};
    $scope.state = {
        message: "",
        sent: false,
        lastReceived: 0,
        updateTimer: null
    };

    ipc.once('conversation', function(ev, conversation) {
        $scope.$apply(function() {
            $scope.conversation = conversation;
            $scope.conversation.messages = _.sortBy(conversation.messages, function(m) { return m.timestamp; });
            $scope.refreshLast();
        });
    });

    ipc.on('conversation-update', function(ev, conversation) {
        $scope.$apply(function() {
            if($scope.messages) {
                Array.prototype.push.apply($scope.messages, conversation.messages);
            } else {
                $scope.messages = conversation.messages;
            }
            $scope.refreshLast();
        });
    });

    $scope.getAvatar = avatar.getAvatarForID.bind(avatar);

    $scope.sendMessage = function() {
        if($scope.state.message.length > 0 && !$scope.state.sent) {
            ipc.once('conversation-write', function(event, result) {
                $scope.$apply(function() {
                    $scope.state.message = "";
                    $scope.state.sent = false;
                });
            });
            $scope.state.sent = true;
            ipc.send('conversation-write', $stateParams.id, $scope.state.message);
            ipc.send('conversation-update', $stateParams.id, $scope.state.lastReceived);
        }
    }

    $scope.updateMessages = function() {
        console.log("updating messages - " + $scope.state.lastReceived);
        ipc.send('conversation-update', $stateParams.id, $scope.state.lastReceived);
    };

    $scope.refreshLast = function() {
        var last = _.last($scope.messages);
        if(last) {
            $scope.state.lastReceived = last.id;
        } else {
            $scope.state.lastReceived = 0;
        }
    };

    ipc.send('conversation', $stateParams.id);
    $scope.state.updateTimer = $interval(function() { $scope.updateMessages(); }, MESSAGE_UPDATE_DELAY);

    $scope.$on('$stateChangeStart', function(event, toState, toParams, from) {
        if(from.name == 'message') {
            $interval.cancel($scope.state.updateTimer);
        }
    });
}]);
