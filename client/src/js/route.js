// ADAM ADDED 12/18  https://stackoverflow.com/questions/38913371/angularjs-route-provider-changes-into-2f#41848944
angular.module('app')
    .config(['$locationProvider', function($locationProvider){
	$locationProvider.hashPrefix('');
    }]);

angular.module('app')
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl:    'views/home.html'
            })
            .when('/login', {
                templateUrl:    'views/login.html',
                controller:     'LoginController',
                controllerAs:   'vm'
            })
            .when('/users', {
                templateUrl:    'views/users.html',
                controller:     'UserController',
                controllerAs:   'vm'
            })
            .when('/adduser', {
                templateUrl:    'views/adduser.html',
                controller:     'AddUserController',
                controllerAs:   'vm'
            })
            .when('/edituser/:userId', {
                templateUrl:    'views/edituser.html',
                controller:     'EditUserController',
                controllerAs:   'vm'
            })
            .when('/changeuserpassword/:userId', {
                templateUrl:    'views/changeuserpassword.html',
                controller:     'ChangeUserPasswordController',
                controllerAs:   'vm'
            })
            .when('/resources', {
                templateUrl:    'views/resources.html',
                controller:     'ResourceController',
                controllerAs:   'vm'
            })
            .when('/addresource', {
                templateUrl:    'views/addresource.html',
                controller:     'AddResourceController',
                controllerAs:   'vm'
            })
            .when('/editresource/:resourceId', {
                templateUrl:    'views/editresource.html',
                controller:     'EditResourceController',
                controllerAs:   'vm'
            })
            .when('/cards', {
                templateUrl:    'views/cards.html',
                controller:     'CardController',
                controllerAs:   'vm'
            })
            .when('/keycodes', {
                templateUrl:    'views/keycodes.html',
                controller:     'CardController',
                controllerAs:   'vm'
            })
            .when('/editcard/:cardId', {
                templateUrl:    'views/editcard.html',
                controller:     'EditCardController',
                controllerAs:   'vm'
            })
            .when('/logs', {
                templateUrl:    'views/logs.html',
                controller:     'LogController',
                controllerAs:   'vm'
            })
    }]);
