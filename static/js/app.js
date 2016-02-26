angular
    .module('app', ['ngRoute', 'ngResource'])
    .run(runApp)
    .config(configApp);

runApp.$inject = ['$rootScope', '$location'];

function runApp($rootScope, $location) {

    $rootScope.globals = {};

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
