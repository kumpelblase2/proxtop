angular.module('proxtop').config(['$mdThemingProvider', function(themingProvider) {
	themingProvider.theme('default')
		.primaryPalette('brown')
		.accentPalette('grey')
		.dark();
}]);
