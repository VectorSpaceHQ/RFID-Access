(function () {
    'use strict';

    angular
        .module('app')
        .factory('AuthService', AuthService);

    AuthService.$inject = ['$resource', '$location', '$http', '$rootScope', 'Base64'];

    function AuthService($resource, $location, $http, $rootScope, Base64) {

        var url = '//' + $location.host() + ':' + $location.port() + '/api/users/:userId';

        return {
            loginUser:          loginUser,
            saveCredentials:    saveCredentials,
            clearCredentials:   clearCredentials
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

            return login.get();
        }

        function saveCredentials(username, password) {
            var authData = Base64.encode(username + ':' + password);

            $http.defaults.headers.common['Authorization'] = 'Basic ' + authData;

            $rootScope.globals = {
                currentUser: {
                    username: username,
                    autData: authData
                }
            };
        }

        function clearCredentials() {
            $http.defaults.headers.common['Authorization'] = 'Basic ';
            $rootScope.globals = {};
        }
    }

})();
