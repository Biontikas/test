// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('security.service', [
        'security.retryQueue',    // Keeps track of failed requests that need to be retried once the user logs in
        'security.login'         // Contains the login form template and controller
    ])

    .factory('security', ['$rootScope', '$http', '$q', '$location', 'securityRetryQueue', 'API', function ($rootScope, $http, $q, $location, queue, API) {

        // Redirect to the given url (defaults to '/')
        function redirect(url) {
            url = url || '/';
            $location.path(url);
        }

        // Register a handler for when an item is added to the retry queue
        queue.onItemAddedCallbacks.push(function () {
            if (queue.hasMore()) {
                service.showLogin();
            }
        });

        // The public API of the service
        var service = {

            // Get the first reason for needing a login
            getLoginReason: function () {
                return queue.retryReason();
            },

            // Show the modal login dialog
            showLogin: function () {
                //openLoginDialog();
                redirect();
            },

            // Attempt to authenticate a user by the given email and password
            login: function (cardid, pass) {
                return $http.post(API.login, {login: cardid, pass: pass}).then(function (response) {
                    service.currentUser = (response.data.status) ? response.data.user : null;
                    $rootScope.$emit('SET_USER');
                    return response;
                    //return service.isAuthenticated();
                });
            },

            // Give up trying to login and clear the retry queue
            cancelLogin: function () {
                redirect();
            },

            // Logout the current user and redirect
            logout: function () {
                return $http.post(API.logout).then(function () {
                    service.currentUser = null;
                    $rootScope.$emit('SET_USER');
                });
            },

            // Ask the backend to see if a user is already authenticated - this may be from a previous session.
            requestCurrentUser: function () {
                if (service.isAuthenticated()) {
                    return $q.when(service.currentUser);
                } else {
                    return $http.get(API.currentUser).then(function (response) {
                        service.currentUser = (angular.isObject(response.data)) ? response.data.user : null;
                        $rootScope.$emit('SET_USER');
                        return service.currentUser;
                    });
                }
            },

            // Information about the current user
            currentUser: null,

            // Is the current user authenticated?
            isAuthenticated: function () {
                return !!service.currentUser;
            },

            // Is the current user an adminstrator?
            isAdmin: function () {
                return !!(service.currentUser && service.currentUser.admin);
            }
        };

        return service;
    }]);
