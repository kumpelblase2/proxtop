angular.module('proxtop', ['ngMaterial', 'ngSanitize', 'ui.router', 'angular-progress-arc', 'pascalprecht.translate', 'debounce'])
    .config(['$stateProvider', '$urlRouterProvider', '$translateProvider', function($stateProvider, $urlRouterProvider, $translateProvider) {
        $urlRouterProvider.otherwise('/');
        $translateProvider.useStaticFilesLoader({
            prefix: 'locale/locale-',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('de');
        $translateProvider.useSanitizeValueStrategy('escape');
    }]);
