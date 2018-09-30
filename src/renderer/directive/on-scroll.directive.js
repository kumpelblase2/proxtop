angular.module('proxtop').directive('onScroll', ['debounce', function(debounce) {
    return {
        restrict: 'A',
        scope: {
            scroll: '&onScroll'
        },
        link: function(scope, elem) {
            const expression = scope.scroll();
            elem.on('scroll', debounce(1000, () => {
                expression(elem);
            }, true));
        }
    };
}]);
