(function () {
    'use strict';

    angular
        .module('app')
        .factory('AuthHttpInterceptor', AuthHttpInterceptor);

    AuthHttpInterceptor.$inject = ['$q', '$location', '$rootScope'];

    function AuthHttpInterceptor($q, $location, $rootScope) {
        return {
            responseError: responseError
        };

        function responseError(rejection) {
            if ($location.path() != '/login' && rejection.status == 401) {
                $rootScope.$broadcast('authFailed');
            }
            return $q.reject(rejection);
        }
    }
})();