angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('messages', {
        url: '/messages',
        templateUrl: 'ui/messages/messages.html',
        controller: 'MessagesController'
    });

    $stateProvider.state('message', {
        url: '/message/:id',
        templateUrl: 'ui/messages/message.html',
        controller: 'MessageController'
    });
}]);
