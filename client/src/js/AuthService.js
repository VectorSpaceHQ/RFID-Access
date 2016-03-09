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

        var url = '//' + $location.host() + ':' + $location.port() + '/auth';

        return {
            loginUser:          loginUser,
            saveCredentials:    saveCredentials,
            clearCredentials:   clearCredentials,
            isLoggedIn:         isLoggedIn,
            isAdmin:            isAdmin,
            username:           username
        };

        function loginUser (username, password) {
            var login = $resource(url);

            return login.save({ username: username, password: password });
        }

        function saveCredentials(username, token, isAdmin) {
            console.log(token);
            var authData = Base64.encode(token + ':');
            console.log(authData)

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
            } else {
                return false;
            }
        }

        function username() {
            if ($rootScope.globals.currentUser) {
                return $rootScope.globals.currentUser.username;
            } else {
                return '';
            }
        }
    }
})();
