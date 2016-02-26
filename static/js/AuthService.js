(function () {
    'use strict';

    angular
        .module('app')
        .factory('AuthService', AuthService);

    AuthService.$inject = ['$resource', '$location', 'Base64'];

    function AuthService($resource, $location, Base64) {

        var url = '//' + $location.host() + ':' + $location.port() + '/api/users/:userId';

        return {
            loginUser: loginUser,
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
    }

})();
