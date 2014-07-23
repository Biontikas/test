function IdeaOverviewCtrl ($scope, $log, ideaOverviewService, ManageIdeas, toaster) {
    $scope.idea = {};

    $scope.idea.ordersGrid = {
        columns: [
            { header: 'ideaOverview.StartTime', field: 'StartTime', render: 'renderDate', width: 120, sortable: true },
            { header: 'ideaOverview.OpenClose', field: 'OpenClose', render: 'renderOpenClose', width: 60, sortable: true },
            { header: 'ideaOverview.SideID', field: 'Idea.SideID', render: 'renderLongShort', width: 60, sortable: true },
            { header: 'ideaOverview.Quantity', field: 'Quantity', render: 'renderInt', width: 90, sortable: true },
            { header: 'ideaOverview.StartPrice', field: 'StartPrice', render: 'renderInt', width: 100, sortable: true },
            { header: 'ideaOverview.Vwap', field: 'Vwap', render: 'renderTwoDp', width: 100, sortable: true },
            { header: 'ideaOverview.EndTime', field: 'EndTime', render: 'renderDate', width: 150, sortable: true },
            { field: 'FilledQ', visible: false },
            { field: 'FilledPQ', visible: false }
        ],
        showLoading: true
    };

    function getIdeaDetails () {
        // TODO: optimize just with one request, toaster message from translation

        if (ManageIdeas.tabs.isCurrent(ManageIdeas.tabs.map.overview)) {
            $scope.idea.ordersGrid.loading = true;
            ideaOverviewService.getIdeaOrders().then(function (results) {
                $scope.idea.ordersGrid.data = results.data.d;
            }, function (error) {
                $log(error.data.message);
            });

            ideaOverviewService.getIdeaReason().then(function (results) {
                $scope.idea.reason = results.data.d.Reason;
            }, function (error) {
                $log(error.data.message);
            });

            ideaOverviewService.getIdeaGraph().then(function (results) {
                $scope.idea.graph = results.data.d;
            }, function (error) {
                $log(error.data.message);
            });

            toaster.clear();
            toaster.pop('success', 'Success!', 'Idea details updated.', 2000);
        }
    }

    getIdeaDetails();

    $scope.$on(ManageIdeas.tabs.broadcast.updated, function () {
        getIdeaDetails();
    });
}

angular.module('ideaOverview', ['manageIdeas', 'toaster'])

.constant('ideaOverviewTabSettings', {
    id: 'ideaOverview',
    title: 'ideaOverview.title',
    controller: IdeaOverviewCtrl,
    template: 'ideaOverview/ideaOverview.tpl.html',
    requiredIdea: true
})

.factory('ideaOverviewService', ['$rootScope', '$http', 'API', function ($rootScope, $http, API) {
    return {
        item: null,

        getIdeaOrders: function () {
            return $http.get(API.getIdeaOrders).then(function (results) {
                return results;
            });
        },

        getIdeaReason: function () {
            return $http.get(API.getIdeaReason).then(function (results) {
                return results;
            });
        },

        getIdeaGraph: function () {
            return $http.get(API.getIdeaOverviewGraph).then(function (results) {
                return results;
            });
        },

        setItem: function (item) {
            this.item = item;
        },

        getItem: function () {
            return this.item;
        }
    };
}])

.controller('IdeaOverviewCtrl', ['$scope', '$log', 'ideaOverviewService', 'ManageIdeas', 'toaster', IdeaOverviewCtrl]);