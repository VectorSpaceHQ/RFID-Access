angular.module('app', ['ngRoute', 'ngResource'])
    .run(runApp);

    runApp.$inject = ['$rootScope', '$location'];

    function runApp($rootScope, $location) {
        $rootScope.$on('$locationChangeStart', function () {
            if ($location.path() != '/login') {
                $location.path('/login');
            }
        })
    }
