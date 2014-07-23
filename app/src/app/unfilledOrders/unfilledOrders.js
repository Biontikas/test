function UnfilledOrdersCtrl ($scope, $log, $timeout, unfilledOrdersService, ManageIdeas, toaster) {
    $scope.unfilledOrdersGrid = {
        columns: [
            { header: 'unfilledOrders.IdeaId', field: 'Idea.IdeaId', width: 60, sortable: true },
            { header: 'unfilledOrders.StartTime', field: 'StartTime', render: 'renderDate', width: 120, sortable: true },
            { header: 'unfilledOrders.OpenClose', field: 'OpenClose', render: 'renderOpenClose', width: 60, sortable: true },
            { header: 'unfilledOrders.SideID', field: 'Idea.SideID', render: 'renderLongShort', width: 60, sortable: true },
            { header: 'unfilledOrders.SecurityName', field: 'Idea.Security.SecurityName', width: 180, sortable: true },
            { header: 'unfilledOrders.GenericBBTick', field: 'Idea.Security.GenericBBTick', width: 120, sortable: true },
            { header: 'unfilledOrders.Quantity', field: 'Quantity', render: 'renderInt', width: 120 },
            { header: 'unfilledOrders.FilledQ', field: 'FilledQ', render: 'renderFilledPercentage', width: 80, sortable: true },
            { header: 'unfilledOrders.Days', field: 'Days', render: 'renderDays', width: 80, sortable: true },
            { header: 'unfilledOrders.FillTime', field: 'FillTime', render: 'renderDate', width: 120, sortable: true },
            { header: 'unfilledOrders.FilledPQ', field: 'FilledPQ', render: 'renderFillPrice', width: 80, sortable: true },
            { field: 'TargetQ', visible: false }
        ],
        data: [],
        headerHeight: 26,
        showLoading: true
    };

    function getUnfilledOrders () {
        // TODO: toaster message from translation
        if (ManageIdeas.tabs.isCurrent(ManageIdeas.tabs.map.unfilled)) {
            unfilledOrdersService.getUnfilledOrders().then(function (results) {
                $timeout(function () {
                    $scope.unfilledOrdersGrid.data = results.data.d;
                    toaster.clear();
                    toaster.pop('success', 'Success!', 'Unfilled orders updated.', 2000);
                }, 100);
            }, function (error) {
                $log(error.data.message);
            });
        }
    }

    getUnfilledOrders();

    $scope.$on(ManageIdeas.tabs.broadcast.updated, function () {
        getUnfilledOrders();
    });
}

angular.module('unfilledOrders', ['manageIdeas', 'toaster'])

.constant('unfilledOrdersTabSettings', {
    id: 'unfilledOrders',
    title: 'unfilledOrders.title',
    controller: UnfilledOrdersCtrl,
    template: 'unfilledOrders/unfilledOrders.tpl.html',
    requiredIdea: false
})

.factory('unfilledOrdersService', ['$http', 'API', function ($http, API) {
    return {
        getUnfilledOrders: function () {
            return $http.get(API.getUnfilledOrders).then(function (results) {
                return results;
            });
        }
    };
}])

.controller('UnfilledOrdersCtrl', ['$scope', '$log', '$timeout', 'unfilledOrdersService', 'ManageIdeas', 'toaster', UnfilledOrdersCtrl]);