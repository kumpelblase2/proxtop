angular.module('proxtop').controller('ProfileController', ['$scope', 'ipc', '$state', 'ProgressService', function($scope, ipc, $state, progressService) {
    ipc.on('profile', function(profile) {
        $scope.$apply(function() {
            $scope.profile = profile;
            var rank = progressService.getNextRank($scope.profile.ranking.total);
            $scope.profile.progress = rank.points / $scope.profile.ranking.total;
        });
    });

    ipc.on('news', function(news) {
        $scope.$apply(function() {
            $scope.news = news;
        });
    });

    $scope.openNews = function(newsItem) {
        require('shell').openExternal('https://proxer.me' + newsItem.title.link);
    };

    ipc.send('profile');
    ipc.send('news');
}]);
