angular.module('proxtop', ['ngMaterial', 'ui.router', 'angular-progress-arc', 'pascalprecht.translate'])
    .config(['$stateProvider', '$urlRouterProvider', '$translateProvider', function($stateProvider, $urlRouterProvider, $translateProvider) {
        $urlRouterProvider.otherwise('/');
        $translateProvider.useStaticFilesLoader({
            prefix: 'ui/locale/locale-',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('de');
        $translateProvider.useSanitizeValueStrategy('escape');
    }]);
