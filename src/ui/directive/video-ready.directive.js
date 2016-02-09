angular.module('proxtop').directive('videoReady', function($timeout) {
    return {
        restrict: 'AR',
        scope: {
            ready: '='
        },
        link: function(scope, elem, attrs) {
            scope.ready = false;
            console.log("attached!");
            elem.on('canplay', function() {
                console.log("Ready!");
                $timeout(function() {
                    scope.ready = true;
                });
            });
        }
    };
});
