angular.module('proxtop').directive('onScroll', ['debounce', function(debounce) {
    return {
        restrict: 'A',
        scope: {
            scroll: '&onScroll'
        },
        link: function(scope, elem) {
            const expression = scope.scroll();
            elem.on('scroll', debounce(() => {
                expression(elem);
            }, 1000, false, true));
        }
    };
}]);