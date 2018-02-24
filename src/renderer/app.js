import translationDE from '../common/locale/locale-de';
import translationEN from '../common/locale/locale-en';
import webfont from "font-awesome/fonts/fontawesome-webfont.svg";

angular.module('proxtop', ['ngMaterial', 'ngSanitize', 'ui.router', 'angular-progress-arc', 'pascalprecht.translate', 'rt.debounce'])
    .config(['$stateProvider', '$urlRouterProvider', '$translateProvider', '$mdIconProvider', '$logProvider', '$compileProvider', function($stateProvider, $urlRouterProvider, $translateProvider, $mdIconProvider, $logProvider, $compileProvider) {
        $urlRouterProvider.otherwise('/');
        $translateProvider.translations('de', translationDE).translations('en', translationEN);

        $translateProvider.preferredLanguage('de');
        $translateProvider.useSanitizeValueStrategy('escape');

        $mdIconProvider.defaultIconSet(webfont);

        $logProvider.debugEnabled(false);
        $compileProvider.debugInfoEnabled(false);
    }]);
