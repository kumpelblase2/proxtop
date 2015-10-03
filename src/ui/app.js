angular.module('proxtop', ['ngMaterial', 'ui.router', 'angular-progress-arc'])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
    }]);
