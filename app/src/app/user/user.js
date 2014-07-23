angular.module('user', [])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/login', {
        templateUrl: 'user/login.tpl.html'
    });

    $routeProvider.when('/forgot-password', {
        templateUrl: 'user/forgot.tpl.html'
    });

    $routeProvider.when('/change-password', {
        templateUrl: 'user/change.tpl.html'
    });
}])

.controller('LoginCtrl', ['$scope', 'security', function ($scope, security) {
    security.requestCurrentUser();
}]);
