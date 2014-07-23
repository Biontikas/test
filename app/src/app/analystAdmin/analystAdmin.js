angular.module('analystAdmin', ['security.authorization'])

.config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
    $routeProvider.when('/analyst-admin', {
        templateUrl: 'analystAdmin/analystAdmin.tpl.html',
        controller: 'AnalystAdminCtrl',
        resolve: {
            authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
        }
    });
}])

.factory('analystService', ['$http', 'API', function ($http, API) {
    return {
        getData: function () {
            return $http.get(API.getAll).then(function (results) {
                return results;
            });
        }
    };
}])

.controller('AnalystAdminCtrl', ['$scope', '$timeout', '$log', 'analystService', function ($scope, $timeout, $log, analystService) {
    $scope.analystGrid = {
        columns: [
            { header: 'analyst.FirstName', field: 'FirstName', width: 220, sortable: true },
            { header: 'analyst.LastName', field: 'LastName', width: 220, sortable: true },
            { header: 'analyst.Email', field: 'Email', width: 250, sortable: true },
            { header: 'analyst.PhoneNumber', field: 'PhoneNumber', width: 150, sortable: true },
            { header: 'analyst.IsActive', field: 'IsActive', render: 'renderCheckbox', width: 100, sortable: true }
        ],
        showLoading: true
    };

    function getData () {
        $scope.analystGrid.loading = true;
        analystService.getData().then(function (results) {
            $scope.analystGrid.data = results.data.d;
        }, function (error) {
            $log(error.data.message);
        });
    }

    getData();

    $scope.analystGrid.newAnalyst = function () {
        console.log('newAnalyst');
    };

    $scope.analystGrid.save = function () {
        console.log('save');
    };

    $scope.analystGrid.clearChanges = function () {
        console.log('clearChanges');
    };
}]);