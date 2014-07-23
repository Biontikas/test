angular.module('portfolio', ['security.authorization', 'manageIdeas'])

.config(['$routeProvider', 'securityAuthorizationProvider', function ($routeProvider, securityAuthorizationProvider) {
    $routeProvider
        .when('/portfolio/:type?', {
            templateUrl: 'portfolio/portfolio.tpl.html',
            controller: 'PortfolioCtrl',
            reloadOnSearch: false,
            resolve: {
                authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
            }
        });
}])

.value('PortfolioSettings', {
    Industry: {
        Label: 'industry',
        GroupBy: 'GroupedBy',
        SortBy: 'QuintileRank',
        SortDirection: false,
        Url: 'getPositionsByIndustry'
    },
    Analyst: {
        Label: 'analyst',
        GroupBy: 'GroupedBy',
        SortBy: 'QuintileRank',
        SortDirection: false,
        Url: 'getPositionsByAnalyst'
    },
    IdeaPriceThreshold: 5,
    MaxIdeasAge: 165,
    OldIdeasAlertDisplayed: false
})

.factory('portfolioService', ['$http', function ($http) {
    return {
        getPositions: function (url) {
            return $http.get(url).then(function (results) {
                return results;
            });
        }
    };
}])

.controller('PortfolioCtrl', ['$scope', '$q', '$http', '$timeout', '$routeParams', '$route', '$log', 'API', 'portfolioService', 'PortfolioSettings', 'ManageIdeas',
        function ($scope, $q, $http, $timeout, $routeParams, $route, $log, API, portfolioService, PortfolioSettings, ManageIdeas) {
    var portfolioType = (angular.isDefined($routeParams.type) && $routeParams.type === PortfolioSettings.Analyst.Label) ?
        PortfolioSettings.Analyst :
        PortfolioSettings.Industry;

    $scope.portfolioGrid = {
        columns: [
            { header: 'portfolio.SecurityName', field: 'SecurityName', render: 'renderIdeaIdSecurityName', group: { field: 'GroupedBy', render: 'renderImage' }, width: 300, sortable: true },
            { header: 'portfolio.Ticker', field: 'Ticker', group: { field: 'QuintileRank', render: 'renderRank' }, width: 140, sortable: true },
            { header: 'portfolio.Quantity', field: 'Quantity', render: 'renderInt', width: 90 },
            { header: 'portfolio.PrevClose', field: 'PrevClose', render: 'renderTwoDp', width: 90 },
            { header: 'portfolio.NetExposure', field: 'NetExposure', render: 'renderEuro', group: { field: 'NetExposureGroup', render: 'renderEuro' }, width: 110, sortable: true },
            { header: 'portfolio.IdeaCost', field: 'IdeaCost', render: 'renderEuro', width: 90 },
            { header: 'portfolio.MTDMarketNeutralReturn', field: 'MTDMarketNeutralReturn', render: 'renderPercent', group: { field: 'MTDMarketNeutralReturnGroup', render: 'renderPercent' }, width: 100, sortable: true },
            { header: 'portfolio.YTDMarketNeutralReturn', field: 'YTDMarketNeutralReturn', render: 'renderPercent', group: { field: 'YTDMarketNeutralReturnGroup', render: 'renderPercent' }, width: 100, sortable: true },
            { header: 'portfolio.YTDLongMarketNeutralReturnGroup', /*field: '',*/ group: { field: 'YTDLongMarketNeutralReturnGroup', render: 'renderLongReturn' }, width: 100, sortable: true },
            { header: 'portfolio.YTDShortMarketNeutralReturnGroup', /*field: '',*/ group: { field: 'YTDShortMarketNeutralReturnGroup', render: 'renderShortReturn' }, width: 100, sortable: true },
            { header: 'portfolio.PriceTarget', field: 'PriceTarget', width: 70 },
            { header: 'portfolio.RemainingAlpha', field: 'RemainingAlpha', render: 'renderTwoDp', group: { field: 'RemainingAlphaGroup', render: 'renderTwoDp' }, width: 110, sortable: true },
            { header: 'portfolio.UnitCost', field: 'UnitCost', render: 'renderTwoDp', width: 90 },
            { header: 'portfolio.NumberPositionChanges', field: 'NumberPositionChanges', group: { field: 'NumberPositionChanges' }, width: 100, sortable: true },
            { header: 'portfolio.DaysActive', field: 'DaysActive', group: { field: 'DaysActiveGroup' }, width: 90, sortable: true },
            { header: 'portfolio.StartDate', field: 'StartDate', render: 'renderCloseDate', width: 70 },
            { header: 'portfolio.CloseDate', field: 'CloseDate', render: 'renderCloseDate', width: 70 },
            { field: 'Rank', visible: false },
            { field: 'IdeaID', visible: false },
            { field: 'PrevClose', visible: false },
            { field: 'Side', visible: false },
            { field: 'PriceTarget', visible: false },
            { field: 'OutOf', visible: false },
            { field: 'LongIdeasGroup', visible: false },
            { field: 'ShortIdeasGroup', visible: false }
        ],
        sort: portfolioType.SortBy,
        reverse: portfolioType.SortDirection,
        groupBy: portfolioType.GroupBy,
        headerHeight: 42,
        showLoading: true,
        collapsible: true,
        getRowClass: function(item, index/*, rp*/) {
            if (item.DaysActive > PortfolioSettings.MaxIdeasAge) {
                if (index %2 !== 0) {
                   return 'grid-row-divider-yellow-alt';
                } else {
                    return 'grid-row-divider-yellow';
                }
            }

            if (/*rp.cells && */index %2 === 0) {
                return 'grid-row-divider';
            }
        },
        getGroupClass: function(group, index) {
            var className = '',
                rank = calculateRank(group.item.Rank / group.item.OutOf);

            if (rank === 0) {
                if (index %2 !== 0) {
                    className = 'grid-group-hd grid-row-sector1';
                } else {
                    className = 'grid-group-hd grid-row-sector2';
                }
            } else  {
                className = 'grid-group-hd grid-row-sector' + rank;
            }

            return className;
        },
        cellSelect: function(idea) {
            ManageIdeas.idea.set(idea);
        }
    };

    function getPostions () {
        $scope.portfolioGrid.loading = true;
        portfolioService.getPositions(API[portfolioType.Url]).then(function (results) {
            //$timeout(function() {
                $scope.portfolioGrid.data = results.data.d;
                //_.defer($scope.portfolioGrid.data, results.data.d);
                /*$timeout.cancel($scope.portfolioGrid.timer);
                $scope.portfolioGrid.timer = $timeout(function(){
                    getPostions();
                }, 120000);*/
            //}, 100);
        }, function (error) {
            $log(error.data.message);
        });
    }

    /*$scope.$on(
        "$destroy",
        function (event) {
            $timeout.cancel($scope.portfolioGrid.timer);
            console.log("Timer Canceled!", Date.now());
        }
    );*/

    getPostions();

    $scope.portfolio = {
        refresh: function () {
            getPostions();
        },

        summaryReport: function () {
            this.generatePdf();
        },

        createIdea: function () {
            ManageIdeas.tabs.open(ManageIdeas.tabs.map.create);
        },

        panel: ManageIdeas.panel,

        generatePdf: function (val) {
            var val = val || '',
                reportType = 3;

            if (val !== '') {
                reportType = 1;

                if (_isAnalyst) {
                    reportType = 2;
                }
            }

            val = val.replace(/&/g, 'REPLACESTRING');

            /*if (Ext.isIE) {
                var handler = document.getElementById('linkReportHandler');

                if (handler !== null) {
                    handler.href = '../ReportWriters/Export2PDF.aspx?id=' + val + '&type=' + reportType;
                    handler.click();
                }
            } else {*/
                window.open('../ReportWriters/Export2PDF.aspx?id=' + val + '&type=' + reportType, this.target ? this.target : '_new');
            /*}*/
        }
    };

    /*function checkChanged(el,checked)
    {
        //change the current checked state
        PortfolioWebService.SetIncludeClosed(checked, getPostions());
    }*/
}]);
//function used to calculate which quintile a industry's rank is in.
function calculateRank(rank) {
    var tempRank = 0;

    if (rank >= 0 && rank < 0.2) {
        tempRank  = 1;
    } else if (rank >= 0.2 && rank < 0.4) {
        tempRank  = 2;
    } else if (rank >= 0.4 && rank < 0.6) {
        tempRank  = 3;
    } else if (rank >= 0.6 && rank < 0.8) {
        tempRank = 4;
    } else if (rank >= 0.8 && rank <= 1.0) {
        tempRank = 5;
    }

    return tempRank;
}