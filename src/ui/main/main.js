angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('main', {
        url: '/',
        templateUrl: 'ui/main/main.html',
        controller: 'MainController'
    });
}]);
