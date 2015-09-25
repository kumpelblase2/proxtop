angular.module('proxtop').controller('MainController', ['$scope', 'settings', function($scope, settings) {
    $scope.settings = settings.get();
}]);
