'use strict';

window.deferredBootstrapper.bootstrap({
    element: window.document,
    module: 'app',
    resolve: {
        APP: function ($http) {
            return $http.get('config/app.json');
        },
        TRANSLATIONS: function ($http) {
            return $http.get('config/translations.json');
        },
        API: function ($http) {
            return $http.get('mockups/api');
        }
    },
    onError: function (error) {
        console.log('Could not bootstrap, error: ' + error);
    }
});

angular.module('app', [
    'ngRoute',
    'ngSanitize',
    'pasvaz.bindonce',
    'pascalprecht.translate',
    'angular-loading-bar',
    'user',
    'portfolio',
    'activityHistory',
    'analystAdmin',
    'summary',
    'help',
    'security',
    'services.httpRequestTracker',
    'filters',
    'directives',
    'templates.app'])

.config(['$httpProvider', '$routeProvider', '$locationProvider', '$translateProvider', 'APP', 'TRANSLATIONS',
    function ($httpProvider, $routeProvider, $locationProvider, $translateProvider, APP, TRANSLATIONS) {
        // html5 links
        $locationProvider.html5Mode(true).hashPrefix('!');
        // default route
        $routeProvider.otherwise({redirectTo: APP.url.login});
        //translations
        angular.forEach(APP.langs.available, function (key) {
            $translateProvider.translations(key, TRANSLATIONS[key]);
        });
        $translateProvider
            .usePostCompiling(true)
            .preferredLanguage(APP.langs.defaultLang);
    }])

/*.run(['security', function (security) {
    //console.log('run - requestCurrentUser');
    security.requestCurrentUser();
}])*/

.controller('AppCtrl', ['$rootScope', '$scope', '$location', 'APP', 'security', '$translate',
    function ($rootScope, $scope, $location, APP, security, $translate) {
        $scope.$on('$routeChangeError', function (/*event, current, previous, rejection*/) {
            //i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection: rejection});
        });

        // translations
        $scope.languages = APP.langs.available;
        $scope.currentLang = APP.langs.defaultLang;
        $scope.changeLanguage = function (lang) {
            $scope.currentLang = lang;
            $translate.use(lang);
            $scope.$broadcast('translateChangeSuccess');
        };

        // user
        $scope.logout = function () {
            security.logout().then(function () {
                $location.path('/');
                $scope.changeLanguage(APP.langs.defaultLang);
            });
        };
        $scope.setUser = function () {
            $scope.user = security.currentUser;
            $scope.isAuthenticated = security.isAuthenticated();
            $scope.setNavigation();
        };
        $rootScope.$on('SET_USER', function () {
            $scope.setUser();

            if (security.isAuthenticated()) {
                $location.path(APP.url.authRedirect);
            }
        });

        // navigation
        $scope.location = $location;
        $scope.setNavigation = function () {
            $scope.navigation = [];

            if ($scope.isAuthenticated && !angular.isUndefined(APP.navigation)) {
                angular.forEach(APP.navigation, function(item) {
                    if (item.role.indexOf($scope.user.role) !== -1) {
                        $scope.navigation.push(item);
                    }
                });
            }
        };

        /*$scope.$on('$routeChangeSuccess', function () {
            console.log('$routeChangeSuccess');
            $scope.setUser();
        });*/

        //$scope.setUser();
    }])

.controller('HeaderCtrl', ['$scope', 'httpRequestTracker', function ($scope, httpRequestTracker) {
    $scope.isNavigation = function () {
        return angular.isObject($scope.navigation);
    };

    $scope.hasPendingRequests = function () {
        return httpRequestTracker.hasPendingRequests();
    };
}]);