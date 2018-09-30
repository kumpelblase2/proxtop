angular.module('proxtop').directive('videoReady', function($timeout) {
    return {
        restrict: 'AR',
        scope: {
            ready: '=',
            watchProgress: '&'
        },
        link: function(scope, elem, attrs) {
            scope.ready = false;
            elem.on('canplay', function() {
                $timeout(function() {
                    scope.ready = true;
                });
            });

            elem.on('timeupdate', (ev) => {
                scope.watchProgress({ time: Math.round(ev.target.currentTime), total: ev.target.duration });
            });
        }
    };
});
