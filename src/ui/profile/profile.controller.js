angular.module('proxtop').controller('ProfileController', ['$scope', 'ipc', '$state', 'ProgressService', function($scope, ipc, $state, progressService) {
    ipc.on('profile', function(ev, profile) {
        console.log(profile);
        $scope.$apply(function() {
            $scope.profile = profile;
            var rank = progressService.getNextRank($scope.profile.ranking.total);
            $scope.profile.progress = rank.points / $scope.profile.ranking.total;
        });
    });

    ipc.on('news', function(ev, news) {
        $scope.$apply(function() {
            $scope.news = news;
        });
    });

    $scope.openNews = function(newsItem) {
        require('shell').openExternal('https://proxer.me/forum/' + newsItem.catid + '/' + newsItem.mid);
    };

    $scope.createNewsImage = function(newsItem) {
        return 'https://cdn.proxer.me/news/' + newsItem.nid + "_" + newsItem.image_id + '.png';
    };

    ipc.send('profile');
    ipc.send('news');
}]);
