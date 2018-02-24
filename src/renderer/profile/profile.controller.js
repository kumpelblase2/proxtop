angular.module('proxtop').controller('ProfileController', ['$scope', 'ipcManager', '$state', 'ProgressService', 'shell', 'session', 'AvatarService', function($scope, ipcManager, $state, progressService, shell, session, avatarService) {
    const ipc = ipcManager($scope);
    ipc.once('profile', (ev, profile) => {
        $scope.profile = profile;
        $scope.profile.progress = progressService.getProgressToNextRank($scope.profile.ranking.total);
        $scope.profile.avatarUrl = avatarService.getAvatarForID(profile.avatar);
    });

    ipc.once('news', (ev, news) => {
        $scope.news = news;
    });

    $scope.openNews = (newsItem) => {
        shell.openExternal('https://proxer.me/forum/' + newsItem.catid + '/' + newsItem.mid);
    };

    $scope.createNewsImage = (newsItem) => {
        return 'https://cdn.proxer.me/news/' + newsItem.nid + "_" + newsItem.image_id + '.png';
    };

    $scope.myRank = () => progressService.getCurrentRank($scope.profile.ranking.total);

    ipc.send('profile', session.getUser());
    ipc.send('news');
}]);
