angular.module('app', ['ngRoute', 'ngResource'])
    .run(runApp);

    runApp.$inject = ['$rootScope', '$location'];

    function runApp($rootScope, $location) {

        $rootScope.globals = {};

        $rootScope.$on('$locationChangeStart', function () {
            if ($location.path() != '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');
            }
        })
    }
