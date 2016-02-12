angular.module('proxtop').directive('videoReady', function($timeout) {
    return {
        restrict: 'AR',
        scope: {
            ready: '='
        },
        link: function(scope, elem, attrs) {
            scope.ready = false;
            elem.on('canplay', function() {
                $timeout(function() {
                    scope.ready = true;
                });
            });
        }
    };
});
