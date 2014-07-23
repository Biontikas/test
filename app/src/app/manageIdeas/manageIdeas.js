angular.module('manageIdeas', ['unfilledOrders', 'ideaOverview', 'createIdea', 'editIdea', 'toaster'])

.service('ManageIdeas', ['$rootScope', '$injector', 'toaster', function ($rootScope, $injector, toaster) {
    var ManageIdeas = {
        panel: {
            broadcast: {
                updated: 'idea-panel-status-changed'
            },
            status: true,
            toggle: function () {
                this.status = !this.status;
                $rootScope.$broadcast(this.broadcast.updated);

                return this.status;
            }
        },
        tabs: {
            broadcast: {
                updated: 'idea-panel-tab-changed'
            },
            map: {
                unfilled: 'unfilledOrders',
                overview: 'ideaOverview',
                create: 'createIdea',
                edit: 'editIdea'
            },
            list: [],
            current: null,
            setList: function () {
                angular.forEach(this.map, function (item) {
                    var settingsName = item + 'TabSettings';

                    if ($injector.has(settingsName)) {
                        ManageIdeas.tabs.list.push($injector.get(settingsName));
                    }
                });
            },
            isCurrent: function (tab) {
                return tab === this.current;
            },
            open: function (tab) {
                var next = _.findWhere(this.list, { id: tab });

                if (next.requiredIdea && _.isEmpty(ManageIdeas.idea.current)) {
                    toaster.clear();
                    toaster.pop('warning', 'Warning!', 'Select an idea.', 2000);
                    return false;
                }

                this.current = tab;
                $rootScope.$broadcast(this.broadcast.updated);
            }
        },
        idea: {
            broadcast: {
                updated: 'idea-item-changed'
            },
            current: null,
            set: function (idea) {
                this.current = idea;
                $rootScope.$broadcast(this.broadcast.updated);

                if (!_.isEmpty(this.current)) {
                    ManageIdeas.tabs.open(ManageIdeas.tabs.map.overview);
                }
            }
        }
    };

    ManageIdeas.tabs.setList();

    return ManageIdeas;
}])

.controller('ManageIdeasCtrl', ['$scope', '$injector', 'ManageIdeas', function ($scope, $injector, ManageIdeas) {
    $scope.panel = ManageIdeas.panel;
    $scope.tabs = ManageIdeas.tabs;
    $scope.tabs.open(_.first($scope.tabs.list).id);
}]);