angular.module('summary', ['security.authorization'])

.config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
    $routeProvider.when('/summary', {
        templateUrl: 'summary/summary.tpl.html',
        controller: 'SummaryCtrl',
        resolve: {
            authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
        }
    });
}])

.factory('summaryService', ['$http', 'API', function ($http, API) {
    return {
        getContent: function () {
            return $http.get(API.getSummaryPageContent).then(function (results) {
                return results;
            });
        }
    };
}])

.controller('SummaryCtrl', ['$scope', '$log', '$sce', 'summaryService', function ($scope, $log, $sce, summaryService) {
    $scope.data = {
        summary: ''
    };

    function getContent () {
        summaryService.getContent().then(function (results) {
            $scope.data.summary = $sce.trustAsHtml(results.data.d);
        }, function (error) {
            $log(error.data.message);
        });
    }

    getContent();
}]);