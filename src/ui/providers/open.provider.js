angular.module('proxtop').service('open', ['ipc', 'settings', '$state', function(ipc, settings, $state) {
    var self = this;
    ['Anime', 'Manga'].forEach(function(name) {
        var lower = name.toLowerCase();
        self['open' + name] = function(id, ep, sub) {
            if(settings.get(lower).open_with === 'internal') {
                $state.go('watch', {
                    id: id,
                    ep: ep,
                    sub: sub
                });
            } else {
                ipc.send('open', lower, id, ep, sub);
            }
        };
    });
}]);
