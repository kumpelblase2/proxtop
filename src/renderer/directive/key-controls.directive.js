angular.module('proxtop').directive('keyControls', function($document) {
    return {
        restrict: 'AE',
        link: function(scope, elem, attrs) {
            const video = elem[0].querySelector('video');
            elem.bind("keyup", function(e) {
                if(e.keyCode == 32) {
                    if(video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                }
           });
        }
    };
});
