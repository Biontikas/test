angular.module('filters', [])

//Show nothing to grid
.filter('renderBlank', [function () {
    return '';
}])

//math function to return number rounded to x figures
.filter('roundNumber', [function () {
    return function(num, dec) {
        var val = '';

        if (!isNaN(num) && !isNaN(dec)) {
            val = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
        }

        return val;
    };
}])

//format number to comma string
.filter('addCommas', [function () {
    return function(nStr) {
        nStr += '';
        var x = nStr.split('.'),
            x1 = x[0],
            x2 = x.length > 1 ? '.' + x[1] : '',
            rgx = /(\d+)(\d{3})/;

        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }

        return x1 + x2;
    };
}])

.filter('renderInt', ['$filter', function ($filter) {
    return function(val) {
        val = $filter('roundNumber')(val, 0);
        val = $filter('addCommas')(val);

        return val;
    };
}])

//add euro sign to number
.filter('renderEuro', ['$filter', function ($filter) {
    return function(val) {
        var ccy = 'EUR';
        // TODO: load code from settings
        //ccy = currentUserAndPoolProperties.PortfolioCurrencyCode;

        if (ccy === 'EUR') {
            val = '&euro;' + $filter('renderInt')(val);
        } else if (ccy === 'USD') {
            val = '&#36;' + $filter('renderInt')(val);
        } else if (ccy === 'GBP') {
            val = '&#163;' + $filter('renderInt')(val);
        } else if (ccy === 'JPY') {
            val = '&#165;' + $filter('renderInt')(val);
        }

        return val;
    };
}])

//show grid cell to 2 decimal places and format with commas
.filter('formatTwoDp', [function () {
    return function(val) {
        val += '';
        var values = val.split('.');

        val = values[0];

        if (values[1]) {
            val += '.' + values[1];

            if (values[1].length === 1) {
                val += '0';
            }
        } else {
            val += '.00';
        }

        return val;
    };
}])

.filter('renderTwoDp', ['$filter', function ($filter) {
    return function(val) {
        val = $filter('roundNumber')(val, 2);
        val = $filter('addCommas')(val);
        val = $filter('formatTwoDp')(val);

        return val;
    };
}])

//show grid cell as percentage
.filter('renderPercent', ['$filter', function ($filter) {
    return function(val) {
        val = $filter('roundNumber')(val * 100, 2);
        val = $filter('formatTwoDp')(val) + '%';

        return val;
    };
}])

.filter('purifyDate', [function () {
    return function(val) {
        return val.replace('/Date(', '').replace(')/', '');
    };
}])

.filter('renderDate', ['$filter', function ($filter) {
    return function(val) {
        val = val || '';

        return $filter('date')($filter('purifyDate')(val), 'MM/dd/yyyy HH:mm:ss');
    };
}])

.filter('renderCloseDate', ['$filter', function ($filter) {
    return function(val) {
        val = val || '';

        return $filter('date')($filter('purifyDate')(val), 'MM/dd/yyyy');
    };
}])

//bespoke to main grid to show ideaid in same column
.filter('renderIdeaIdSecurityName', ['$filter', function ($filter) {
    return function(val, item) {
        val = '<span class="idea-id" ng-click="showIdeaHistory(' + item.IdeaID + ')">' + item.IdeaID + '</span> ' + val;
        val = val + ' ' + $filter('renderNoticeIco')(val, item);

        return val;
    };
}])

.filter('renderNoticeIco', ['PortfolioSettings', function (PortfolioSettings) {
    return function(val, item) {
        var result = '',
            val = false,
            prevClose = item.PrevClose,
            side = item.Side,
            target = item.PriceTarget,
            ratio = Math.abs((prevClose - target) / prevClose * 100);

        if (ratio <= PortfolioSettings.IdeaPriceThreshold) {
            val = true;
        }

        if (target < prevClose && side === 1) { // long
            val = true;
        }

        if (target > prevClose && side === 2) { // short
            val = true;
        }

        if (val) {
            result = '<i class="ico ico-notice" alt="Current price within 5% of target price, or beyond" /></i>';
        }

        return result;
    };
}])

.filter('toProperCase', [function () {
    return function(val) {
        return val.toLowerCase().replace(/^(.)|\s(.)/g,
            function ($1) {
                return $1.toUpperCase();
            });
    };
}])

//Add pdf image to grid cell
.filter('renderImage', ['$filter', function ($filter) {
    return function(val) {
        val = $filter('toProperCase')(val);
        val = '<i class="ico ico-pdf generate-pdf" data-generate-pdf="' + val + '"></i>' + val;

        return val;
    };
}])

//bespoke for main grid to show rank as a divisional string
.filter('renderRank', [function () {
    return function(val, item) {
        return item.Rank + '/' + item.OutOf;
    };
}])

//render short return with idea count
.filter('renderLongReturn', ['$filter', function ($filter) {
    return function(val, item) {
        return $filter('renderPercent')(val) + ' (' + item.LongIdeasGroup + ')';
    };
}])

//render short return with idea count
.filter('renderShortReturn', ['$filter', function ($filter) {
    return function(val, item) {
        return $filter('renderPercent')(val) + ' (' + item.ShortIdeasGroup + ')';
    };
}])

//renderers for unfilled grid
.filter('renderLongShort', [function () {
    return function(val) {
        return (val === 1) ? 'Long' : 'Short';
    };
}])

.filter('renderOpenClose', [function () {
    return function(val, item) {
        if (val === 'O') {
            return 'Open';
        }

        if (val === 'A') {
            if (angular.isDefined(item.Quantity) && item.Quantity > 0) {
                return 'Increase';
            }

            return 'Decrease';
        }

        return 'Close';
    };
}])

.filter('dateDayDiff', [function () {
    return function(sDate, eDate) {
        return Math.abs(Math.round((sDate-eDate)/86400000));
    };
}])

.filter('renderDays', ['$filter', function ($filter) {
    return function(val, item) {
        return $filter('dateDayDiff')($filter('purifyDate')(item.StartTime), $filter('purifyDate')(item.FillTime));
    };
}])

.filter('renderFillPrice', ['$filter', function ($filter) {
    return function(val, item) {
        return $filter('renderTwoDp')(item.FilledPQ / item.FilledQ);
    };
}])

.filter('renderFilledPercentage', ['$filter', function ($filter) {
    return function(val, item) {
        if (!val || val == 'NaN') {
            return '';
        }

        if (item.TargetQ == 15) {
            val = ((($filter('purifyDate')(item.FillTime)-$filter('purifyDate')(item.OrderTime))/(60*1000))/item.TargetQ)*100;
            val = $filter('renderTwoDp')(val);
            val = $filter('formatTwoDp')(val) + '%';

            return val;
        } else {
            val = (item.FilledQ/item.TargetQ)*100;
            val = $filter('renderTwoDp')(val);
            val = $filter('formatTwoDp')(val) + '%';

            return val;
        }
    };
}])

.filter('renderCheckbox', [function () {
    return function(val) {
        return '<input type="checkbox" name="isActive[]" '+((val) ? 'checked="checked"' : '')+'>';
    };
}]);