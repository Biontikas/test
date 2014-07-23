angular.module('security.authorization', ['security.service'])
    .provider('securityAuthorization', {

        requireAdminUser: ['securityAuthorization', function (securityAuthorization) {
            return securityAuthorization.requireAdminUser();
        }],

        requireAuthenticatedUser: ['securityAuthorization', function (securityAuthorization) {
            return securityAuthorization.requireAuthenticatedUser();
        }],

        $get: ['security', 'securityRetryQueue', function (security, queue) {
            var service = {

                // Require that there is an authenticated user
                // (use this in a route resolve to prevent non-authenticated users from entering that route)
                requireAuthenticatedUser: function () {
                    var promise = security.requestCurrentUser().then(function () {
                        if (!security.isAuthenticated()) {
                            return queue.pushRetryFn('unauthenticated-client', service.requireAuthenticatedUser);
                        }
                    });
                    return promise;
                },

                // Require that there is an administrator logged in
                // (use this in a route resolve to prevent non-administrators from entering that route)
                requireAdminUser: function () {
                    var promise = security.requestCurrentUser().then(function () {
                        if (!security.isAdmin()) {
                            return queue.pushRetryFn('unauthorized-client', service.requireAdminUser);
                        }
                    });
                    return promise;
                }

            };

            return service;
        }]
    });