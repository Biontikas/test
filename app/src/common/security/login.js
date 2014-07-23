angular.module('security.login', [])
    .controller('LoginFormController', ['$scope', '$location', 'security', 'APP', function ($scope, $location, security, APP) {
        // The model for this form
        $scope.user = {
            email: null,
            pass: null
        };

        // Any error message from failing to login
        $scope.authError = null;

        // The reason that we are being asked to login - for instance because we tried to access something to which we are not authorized
        $scope.authReason = null;
        if (security.getLoginReason()) {
            $scope.authReason = ( security.isAuthenticated() ) ?
                'login.reason.notAuthorized' :
                'login.reason.notAuthenticated';
        }

        // Attempt to authenticate the user specified in the form's model
        $scope.login = function () {
            // Clear any previous security errors
            $scope.authError = null;

            // Try to login
            security.login($scope.user.email, $scope.user.pass).then(function (response) {
                if (response.data.status) {
                    $location.path(APP.url.authRedirect);
                } else {
                    // If we get here then the login failed due to bad credentials
                    $scope.authError = 'login.error.invalidCredentials';
                    alert(response.data.message);
                }
            }, function (/*x*/) {
                // If we get here then there was a problem with the login request to the server
                $scope.authError = 'login.error.serverError'; // { exception: x };
            });
        };

        $scope.cancelLogin = function () {
            security.cancelLogin();
        };
    }]);