angular.module('proxtop').config(['$mdThemingProvider', function(themingProvider) {
	themingProvider.theme('default')
		.primaryPalette('blue-grey')
		.accentPalette('blue')
		.dark();
}]);
