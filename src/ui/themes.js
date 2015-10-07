angular.module('proxtop').config(['$mdThemingProvider', function(themingProvider) {
	themingProvider.theme('default')
		.primaryPalette('grey')
		.accentPalette('brown')
		.dark();
}]);
