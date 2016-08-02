angular.module('proxtop').controller('ProfileController', ['$scope', 'ipcManager', '$state', 'ProgressService', 'shell', 'session', function($scope, ipcManager, $state, progressService, shell, session) {
    const ipc = ipcManager($scope);
    ipc.once('profile', (ev, profile) => {
        $scope.profile = profile;
        $scope.profile.progress = progressService.getProgressToNextRank($scope.profile.ranking.total);
    });

    ipc.once('news', (ev, news) => {
        $scope.news = news;
    });

    $scope.openNews = function(newsItem) {
        shell.openExternal('https://proxer.me/forum/' + newsItem.catid + '/' + newsItem.mid);
    };

    $scope.createNewsImage = function(newsItem) {
        return 'https://cdn.proxer.me/news/' + newsItem.nid + "_" + newsItem.image_id + '.png';
    };

    $scope.myRank = () => progressService.getCurrentRank($scope.profile.ranking.total);

    ipc.send('profile', session.getUser());
    ipc.send('news');
}]);
