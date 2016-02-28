angular
    .module('app', ['ngRoute', 'ngResource', 'ngCookies', 'ngFileSaver', 'toastr'])
    .run(runApp)
    .config(configApp);

runApp.$inject = ['$rootScope', '$location', '$cookies', '$http'];

function runApp($rootScope, $location, $cookies, $http) {

    $rootScope.globals = $cookies.getObject('globals') || {};

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
