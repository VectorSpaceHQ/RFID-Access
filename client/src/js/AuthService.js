(function () {
    'use strict';

    angular
        .module('app')
        .factory('AuthService', AuthService);

    AuthService
        .$inject = [
            '$resource',
            '$location',
            '$http',
            '$rootScope',
            '$sessionStorage',
            'Base64'
        ];

    function AuthService($resource, $location, $http, $rootScope, $sessionStorage, Base64) {

        var url = '//' + $location.host() + ':' + $location.port() + '/api/users/:userId';

        return {
            loginUser:          loginUser,
            saveCredentials:    saveCredentials,
            clearCredentials:   clearCredentials,
            isLoggedIn:         isLoggedIn,
            isAdmin:            isAdmin
        };

        function loginUser (username, password) {
            var authData = Base64.encode(username + ':' + password);

            var login = $resource(url,
                {
                    userId: '@id'
                },
                {
                    get: {
                        method: 'GET',
                        headers: { 'Authorization': 'Basic ' + authData }
                    }
                }
            );

            return login.get({ userId: username });
        }

        function saveCredentials(username, password, isAdmin) {
            var authData = Base64.encode(username + ':' + password);

            $http.defaults.headers.common['Authorization'] = 'Basic ' + authData;

            $rootScope.globals = {
                currentUser: {
                    username: username,
                    authData: authData,
                    isAdmin:  isAdmin
                }
            };

            $sessionStorage.globals = $rootScope.globals;

        }

        function clearCredentials() {
            $http.defaults.headers.common['Authorization'] = 'Basic ';
            $rootScope.globals = {};
            delete $sessionStorage.globals;
        }

        function isLoggedIn() {
            return !!$rootScope.globals.currentUser;
        }

        function isAdmin() {
            if ($rootScope.globals.currentUser) {
                return $rootScope.globals.currentUser.isAdmin;
            }
            return false;
        }
    }

})();
