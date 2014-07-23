angular.module('activityHistory', ['security.authorization'])

.config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
    $routeProvider.when('/activity-history', {
        templateUrl: 'activityHistory/activityHistory.tpl.html',
        controller: 'ActivityHistoryCtrl',
        resolve: {
            authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
        }
    });
}])

.factory('activityHistoryService', ['$http', 'API', function ($http, API) {
    return {
        getData: function () {
            return $http.get(API.getActivityHistoryByDateRange).then(function (results) {
                return results;
            });
        }
    };
}])

.controller('ActivityHistoryCtrl', ['$scope', '$timeout', '$log', 'activityHistoryService', function ($scope, $timeout, $log, activityHistoryService) {
    $scope.historyGrid = {
        columns: [
            { header: 'activity.IdeaId', field: 'IdeaId', width: 60, sortable: true },
            { header: 'activity.Action', field: 'Action', render: 'renderOpenClose', width: 60, sortable: true },
            { header: 'activity.SideId', field: 'SideId', render: 'renderLongShort', width: 60, sortable: true },
            { header: 'activity.Ticker', field: 'Ticker', width: 180, sortable: true },
            { header: 'activity.Quantity', field: 'Quantity', render: 'renderTwoDp', width: 180, sortable: true },
            { header: 'activity.Description', field: 'Description', width: 180, sortable: true },
            { header: 'activity.PercentageFilled', field: 'PercentageFilled', render: 'renderPercent', width: 100, sortable: true },
            { header: 'activity.Days', field: 'Days', width: 70, sortable: true },
            { header: 'activity.FillTime', field: 'FillTime', width: 120, sortable: true },
            { header: 'activity.StartTime', field: 'StartTime', width: 120, sortable: true },
            { header: 'activity.CurrentFillPrice', field: 'CurrentFillPrice', render: 'renderTwoDp', width: 100, sortable: true }
        ],
        showLoading: true
    };

    function getData () {
        $scope.historyGrid.loading = true;
        activityHistoryService.getData().then(function (results) {
            $scope.historyGrid.data = results.data.d;
        }, function (error) {
            $log(error.data.message);
        });
    }

    getData();

    $scope.historyGrid.refresh = function () {
        getData();
    };

    $scope.historyGrid.downloadAll = function () {
        console.log('downloadAll');
    };

    $scope.historyGrid.downloadView = function () {
        console.log('downloadView');
    };
}]);