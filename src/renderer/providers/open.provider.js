angular.module('proxtop').service('open', ['ipc', 'settings', '$state', function(ipc, settings, $state) {
    const self = this;
    ['Anime', 'Manga'].forEach(function(name) {
        const lower = name.toLowerCase();
        self['open' + name] = function(id, ep, sub, reminderEntry) {
            const actualSettings = settings.get(lower);

            // TODO refactor this, this looks hacky
            if(actualSettings && (actualSettings.open_with === 'internal' || (lower === 'anime' && actualSettings.open_with === 'external' && actualSettings.pass_raw_url))) {
                $state.go('watch', {
                    id: id,
                    ep: ep,
                    sub: sub,
                    entry: reminderEntry
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
