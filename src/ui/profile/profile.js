angular.module('proxtop').config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('profile', {
        url: '/profile',
        templateUrl: 'ui/profile/profile.html',
        controller: 'ProfileController'
    });
}]);
