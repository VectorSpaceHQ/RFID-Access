angular
    .module('app', ['ngRoute', 'ngResource', 'ngFileSaver', 'toastr', 'ngStorage'])
    .run(runApp)
    .config(configApp);

runApp.$inject = ['$rootScope', '$location', '$http', '$sessionStorage'];

function runApp($rootScope, $location, $http, $sessionStorage) {

    $rootScope.globals = $sessionStorage.globals || {};

    if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authData;
    }

    $rootScope.$on('$locationChangeStart', function () {
        if ($location.path() != '/login' && !$rootScope.globals.currentUser) {
            $location.path('/login');
        }
    })

    $rootScope.$on('authFailed', function () {
        $location.path('/login');
    })
}

configApp.$inject = ['$httpProvider'];

function configApp($httpProvider) {
    $httpProvider.interceptors.push('AuthHttpInterceptor');
}
