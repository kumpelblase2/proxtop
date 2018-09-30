import template from './loader.directive.html'

angular.module('proxtop').directive('loader', function() {
    return {
        restrict: 'E',
        template: template
    };
});
