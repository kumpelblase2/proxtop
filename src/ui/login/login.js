angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'ui/login/login.html',
        controller: 'LoginController'
    });
}]);
