angular.module('proxtop').service('open', ['ipc', 'settings', '$state', function(ipc, settings, $state) {
    var self = this;
    ['Anime', 'Manga'].forEach(function(name) {
        var lower = name.toLowerCase();
        self['open' + name] = function(id, ep, sub) {
            var actualSettings = settings.get(lower);

            if(actualSettings && actualSettings.open_with === 'internal') {
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

    this.openLink = function(link) {
        ipc.send('open-link', link);
    };
}]);
