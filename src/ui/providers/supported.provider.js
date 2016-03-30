const supportedStreams = [
    'proxer-stream',
    'mp4upload',
    'streamcloud2',
    'yourupload'
]

const module = angular.module('proxtop');

module.service('SupportedProviderService', function() {
    this.isSupported = function(stream) {
        if(typeof(stream) == 'object') {
            return supportedStreams.indexOf(stream.type) >= 0;
        } else {
            return supportedStreams.indexOf(stream) >= 0;
        }
    };
});

module.filter('supportedStream', ['SupportedProviderService', function(Supported) {
    return function(input) {
        return input.filter(Supported.isSupported);
    };
}]);
