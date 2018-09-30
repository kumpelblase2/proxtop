import messageTemplate from './message.html';
import messagesTemplate from './messages.html';

angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('messages', {
        url: '/messages',
        template: messagesTemplate,
        controller: 'MessagesController'
    });

    $stateProvider.state('message', {
        url: '/message/:id',
        template: messageTemplate,
        controller: 'MessageController'
    });
}]);
