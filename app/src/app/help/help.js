angular.module('help', ['security.authorization'])

.config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
    $routeProvider.when('/help', {
        templateUrl: 'help/help.tpl.html',
        resolve: {
            authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
        }
    });
}]);