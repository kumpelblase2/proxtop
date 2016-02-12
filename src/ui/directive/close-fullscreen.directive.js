angular.module('proxtop').directive('closeFullscreen', function($document) {
    return {
        restrict: 'AE',
        link: function(scope, elem, attrs) {
            elem.bind("keyup", function(e) {
                if(e.keyCode == 27) {
                    document.webkitExitFullscreen();
                }
           });
        }
    };
});
