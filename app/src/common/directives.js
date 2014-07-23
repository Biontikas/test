angular.module('directives', [])

.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished', { total: scope.$index + 1 });
                });
            }
        }
    };
})

.directive('postRepeatDirective', ['$timeout',
    function ($timeout) {
        return function (scope) {
            if (scope.$first) {
                window.a = new Date(); // window.a can be updated anywhere if to reset counter at some action if ng-repeat is not getting started from $first
            }

            if (scope.$last) {
                $timeout(function () {
                    console.log('## DOM rendering list took: ' + (new Date() - window.a) + ' ms');
                });
            }
        };
    }
])

.directive('generatePdf', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            console.log('test');
            if (scope.$last) { // all are rendered
                scope.$eval(attrs.repeatDone);

                console.log('------');
                console.log(scope);
                console.log(element);
                console.log(attrs);
            }
        }
    };
})

.directive('loadingContainer', function () {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var loadingLayer = angular.element('<div class="loading"></div>');
            element.append(loadingLayer);
            element.addClass('loading-container');
            scope.$watch(attrs.loadingContainer, function(value) {
                loadingLayer.toggleClass('ng-hide', !value);
            });
        }
    };
})

.directive('grid', ['$filter', function ($filter) {
    return {
        restrict: 'A',
        //replace: true,
        scope: {
            grid:'='
        },
        link: function(scope, element) {
            scope.params = scope.grid;
            scope.params.columnsList = [];
            scope.params.columnsFormatted = [];
            scope.params.dataList = [];
            scope.params.prefix = (scope.params.groupBy) ? 'item.' : '';

            scope.params.columns = (angular.isDefined(scope.params.columns)) ? scope.params.columns : [];
            scope.params.data = (angular.isDefined(scope.params.data)) ? scope.params.data : [];
            scope.params.headerHeight = (angular.isDefined(scope.params.headerHeight)) ? scope.params.headerHeight : 26;
            scope.params.showLoading = (angular.isDefined(scope.params.showLoading)) ? scope.params.showLoading : false;
            scope.params.groupBy = (angular.isDefined(scope.params.groupBy)) ? scope.params.groupBy : '';
            scope.params.sort = (angular.isDefined(scope.params.sort)) ? scope.params.prefix + scope.params.sort : '';
            scope.params.reverse = (angular.isDefined(scope.params.reverse)) ? scope.params.reverse : '';
            scope.params.collapsible = (angular.isDefined(scope.params.collapsible) && scope.params.groupBy) ? scope.params.collapsible : false;

            scope.params.loading = (scope.params.showLoading) ? true : false;
            scope.params.gridWidth = (scope.params.gridWidth) ? scope.params.gridWidth : 0;

            function setColumns () {
                var columnsFormatted = [],
                    gridWidth = 0;

                angular.forEach(scope.params.columns, function (column) {
                    var defaultColumn = {
                        header: null,
                        field: null,
                        render: null,
                        group: {
                            field: null,
                            render: null
                        },
                        width: 100,
                        visible: true,
                        sortable: false
                    };

                    columnsFormatted.push($.extend(true, defaultColumn, column));
                });

                scope.params.columnsFormatted = columnsFormatted;
                scope.params.columnsList = $filter('filter')(scope.params.columnsFormatted, { 'visible' : true });

                angular.forEach(scope.params.columnsList, function (column) {
                    gridWidth += column.width;
                });

                if (!scope.params.gridWidth) {
                    scope.params.gridWidth = gridWidth;
                }

                updateSizes();
            }

            function createMapping (data, columns) {
                /*console.time('Mapping');*/

                var result = [],
                    re = /[\[\.]/,
                    getFieldValue = function (field, item) {
                        var fieldValue = null;

                        if (field.search(re) >= 0) {
                            var splitted = field.split('.');
                            fieldValue = item;
                            angular.forEach(splitted, function (value) {
                                value = fieldValue[value];
                                fieldValue = angular.isDefined(value) ? value : '';
                            });
                        } else {
                            var value = item[field];
                            fieldValue = angular.isDefined(value) ? value : '';
                        }

                        return fieldValue;
                    };

                angular.forEach(data, function (item) {
                    var obj = {};

                    angular.forEach(columns, function (column) {
                        if (column.field) {
                            obj[column.field] = getFieldValue(column.field, item);
                        }

                        if (column.render) {
                            var fieldValue = (angular.isDefined(obj[column.field])) ? obj[column.field] : '';
                            obj[column.field+'_rendered'] = $filter(column.render)(fieldValue, item);
                        } else {
                            obj[column.field+'_rendered'] = (column.field && obj[column.field] !== null) ? obj[column.field].toString() : '';
                        }

                        if (column.group.field) {
                            obj[column.group.field] = getFieldValue(column.group.field, item);
                        }

                        if (column.group.render) {
                            var groupValue = (angular.isDefined(obj[column.group.field])) ? obj[column.group.field] : '';
                            obj[column.group.field+'_rendered'] = $filter(column.group.render)(groupValue, item);
                        } else {
                            obj[column.group.field+'_rendered'] = (column.group.field && obj[column.field] !== null) ? obj[column.group.field].toString() : '';
                        }
                    });

                    result.push(obj);
                });

                /*console.timeEnd('Mapping');*/

                return result;
            }

            function setData () {
                if (scope.params.showLoading) {
                    scope.params.loading = true;
                }

                // performance test
                /*for (var j = 0; j < 2; j++) {
                    scope.params.data = $.merge(scope.params.data,scope.params.data);
                }
                console.log(scope.params.data);
                */

                var dataList = createMapping(scope.params.data, scope.params.columnsFormatted);

                if (scope.params.groupBy) {
                    scope.params.groups = [];

                    if (dataList.length) {
                        var groups = {},
                            column = scope.params.groupBy,
                            i = 0;

                        angular.forEach(dataList, function (item) {
                            var groupName = item[column];

                            groups[groupName] = groups[groupName] || {
                                data: []
                            };
                            groups[groupName].id = i++;
                            groups[groupName].item = item;
                            groups[groupName].value = groupName;
                            groups[groupName].hideRows = false;
                            groups[groupName].data.push(item);
                        });

                        var result = [];

                        for (var n in groups) {
                            result.push(groups[n]);
                        }

                        scope.params.groups = result;
                    }
                } else {
                    scope.params.items = dataList;
                }

                if (scope.params.showLoading) {
                    scope.params.loading = false;
                }
            }

            function getBrowserScrollSize () {
                var css = {
                    'border':  'none',
                    'height':  '200px',
                    'margin':  '0',
                    'padding': '0',
                    'width':   '200px'
                };

                var inner = $('<div>').css($.extend({}, css));
                var outer = $('<div>').css($.extend({
                    'left':       '-1000px',
                    'overflow':   'scroll',
                    'position':   'absolute',
                    'top':        '-1000px'
                }, css)).append(inner).appendTo('body')
                .scrollLeft(1000)
                .scrollTop(1000);

                var scrollSize = {
                    'height': (outer.offset().top - inner.offset().top) || 0,
                    'width': (outer.offset().left - inner.offset().left) || 0
                };

                outer.remove();
                return scrollSize;
            }

            function updateSizes () {
                var gridHead = element.find('.grid-head'),
                    gridData = element.find('.grid-data');

                //$timeout(function () {
                    if (scope.params.gridWidth) {
                        //var elemWidth = $(element)[0].scrollWidth;
                        var elemWidth = scope.params.gridWidth;
                        elemWidth = '100%';

                        gridHead.width(elemWidth).css('padding-right', getBrowserScrollSize().width);
                        gridData.width(elemWidth);
                    }
                //});

                element.css('padding-top', scope.params.headerHeight).addClass('grid');
            }

            scope.$watch('params.columns', function (columns) {
                if (columns.length) {
                    setColumns();
                }
            });

            scope.$watch('params.data', function (data) {
                if (data.length) {
                    setData();
                }
            });

            scope.setFilter = function (filterName, value, item) {
                return $filter(filterName)(value, item);
            };

            scope.isAsc = function(field) {
                return (scope.params.prefix + field) === scope.params.sort && !scope.params.reverse;
            };

            scope.isDesc = function(field) {
                return (scope.params.prefix + field) === scope.params.sort && scope.params.reverse;
            };

            scope.changeSort = function(value) {
                scope.params.collapseAll(true);
                value = scope.params.prefix + value;

                if (scope.params.sort === value) {
                    scope.params.reverse = !scope.params.reverse;
                    return;
                }

                scope.params.sort = value;
                scope.params.reverse = false;
            };

            scope.getRowClass = function(item, index) {
                return scope.params.getRowClass(item, index);
            };

            scope.getGroupClass = function(item, index) {
                return scope.params.getGroupClass(item, index);
            };

            scope.rawProperty = function(key) {
                return function(item) {
                    return item[key];
                };
            };

            scope.toggleGroup = function(group) {
                group.hideRows = !group.hideRows;
            };

            scope.cellSelect = function(item) {
                scope.params.cellSelect(item);
            };

            scope.params.collapseAll = function(collapse) {
                collapse = collapse || false;
                angular.forEach(scope.params.groups, function (group) {
                    group.hideRows = collapse;
                });
            };
        },
        templateUrl: 'partials/grid.tpl.html'
    };
}]);