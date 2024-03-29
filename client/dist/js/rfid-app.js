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

(function () {
    'use strict';

    angular
        .module('app')
        .controller('IndexController', IndexController);

    IndexController.$inject = ['$location', 'AuthService'];

    function IndexController($location, AuthService) {
        var vm = this;

        vm.logout = function () {
            $location.url('/login');
        };

        vm.isLoggedIn = function () {
            return AuthService.isLoggedIn();
        };
    }

})();
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

(function () {
    'use strict';

    angular
        .module('app')
        .factory('Base64', Base64);

    function Base64() {

        var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

        return {
            encode: encode,
            decode: decode
        };

        function encode(input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        }

        function decode(input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                console.log("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'AuthService', 'toastr'];

    function LoginController($location, AuthService, toastr) {
        var vm = this;

        AuthService.clearCredentials();

        vm.username = '';
        vm.password = '';
        vm.loading = false;

        vm.login = function() {
            vm.loading = true;

            var loginReq = AuthService.loginUser(vm.username, vm.password);

            loginReq.$promise.then(
                function () {
                    AuthService.saveCredentials(vm.username, loginReq.token, loginReq.admin);
                    $location.path('/');
                },
                function (rejection) {
                    vm.loading = false;

                    var message = 'Unable to login at this time.';

                    if (rejection.status == 401) {
                        message = 'Incorrect username or password';
                    }

                    toastr.error(message,'Login Failed');
                }
            );
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', UserService);

    UserService.$inject = ['$resource', '$location'];

    function UserService($resource, $location) {

        var url = '//' + $location.host() + ':' + $location.port() + '/api/users/:userId';

        return {
            getUsers: getUsers,
            getUser: getUser,
            addUser: addUser,
            saveUser: saveUser,
            removeUser: removeUser
        };

        function getUsers(page) {
            var user = $resource(url);

            return user.get({ page: page });
        }

        function getUser(id) {
            var user = $resource(url,
                {
                    userId: '@id'
                }
            );

            return user.get({ userId: id });
        }

        function addUser(newUser) {
            var user = $resource(url);

            return user.save(newUser);
        }

        function saveUser (id, etag, updates) {
            var user = $resource(url,
                {
                    userId: '@id'
                },
                {
                    save: {
                        method: 'PATCH',
                        headers: { 'If-Match': etag }
                    }
                }
            );

            return user.save({ userId: id }, updates);
        }

        function removeUser(id, etag) {
            var user = $resource(url,
                {
                    userId: '@id'
                },
                {
                    remove: {
                        method: 'DELETE',
                        headers: { 'If-Match': etag }
                    }
                }
            );

            return user.remove({userId: id});
        }
    }

})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('UserController', UserController);

    UserController.$inject = ['toastr', 'UserService', 'AuthService'];

    function UserController(toastr, UserService, AuthService) {
        var vm = this;

        vm.users = [];

        vm.page = 1;

        loadUsers();

        vm.refresh = function refresh() {
            vm.page = 1;
            loadUsers();
        };

        vm.next = function next() {
            if (!vm.lastPage) {
                vm.page++;
                loadUsers();
            }
        };

        vm.prev = function prev() {
            if (vm.page > 1) {
                vm.page--;
                loadUsers();
            }
        };

        vm.removeUser = function removeUser(user) {
            if (!user.removing) {
                user.removing = true;

                var removeUser = UserService.removeUser(user.id, user._etag);

                removeUser.$promise.then(
                    function () {
                        toastr.success('User successfully removed!');

                        if ((vm.users.length == 1) && (vm.page > 1)) {
                            vm.page--;
                        }

                        loadUsers();
                    },
                    function (rejection) {
                        user.removing = false;
                        var message = 'Unable to remove user at this time.';

                        if (rejection.status == 404) {
                            message = 'This user no longer exists.'
                        } else if (rejection.status == 412) {
                            message = 'This user has changed since it was loaded.';
                        }

                        toastr.error(message, 'Error Removing User');

                        loadUsers();
                    }
                )
            }
        };

        vm.isAdmin = function isAdmin() {
            return AuthService.isAdmin();
        };

        function loadUsers() {
            vm.loading = true;
            vm.errorLoading = false;

            var getUsers = UserService.getUsers(vm.page);

            getUsers.$promise.then(
                function () {
                    vm.loading = false;
                    vm.errorLoading = false;
                    vm.users = getUsers._items;

                    vm.lastPage = (getUsers._meta.max_results * vm.page) >= getUsers._meta.total;
                },

                function () {
                    vm.loading = false;
                    vm.errorLoading = true;
                }
            );
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .controller('AddUserController', AddUserController);

    AddUserController.$inject = ['$location', 'toastr', 'UserService'];

    function AddUserController($location, toastr, UserService) {
        var vm = this;

        vm.username = '';
        vm.password = '';
        vm.isAdmin = false;

        vm.adding = false;

        vm.addUser = function addUser() {

            vm.adding = true;

            var add = UserService.addUser({
                username:   vm.username,
                password:   vm.password,
                admin:      vm.isAdmin
            });

            add.$promise.then(

                function () {
                    toastr.success('User successfully added!');
                    $location.path('users');
                },

                function (rejection) {
                    vm.adding = false;

                    var message = 'Unable add new user at this time.';

                    if (rejection.data && rejection.data._issues && rejection.data._issues.username)
                    {
                        var issue = rejection.data._issues.username;

                        if (issue.indexOf('unique') != -1) {
                            message = 'This username already exists. Change the username and try again.';
                        }
                    }

                    toastr.error(message, 'Error Adding User');
                }
            )
        };
    }
})();
(function() {
    'use strict';

    angular
        .module('app')
        .controller('EditUserController', EditUserController);

    EditUserController.$inject = ['$routeParams', '$location', 'toastr', 'UserService'];

    function EditUserController($routeParams, $location, toastr, UserService) {
        var vm = this;

        vm.saving = false;

        loadUser();

        vm.saveUser = function () {

            vm.saving = true;

            var user = {
                admin:      vm.isAdmin
            };

            if (vm.username != vm.oldUsername) {
                user['username'] = vm.username;
            }

            var saveUser = UserService.saveUser(vm.id, vm.etag, user);

            saveUser.$promise.then(

                function () {
                    toastr.success('User saved!');
                    $location.path('users');
                },

                function (rejection) {
                    vm.saving = false;

                    var message = 'Unable to save user at this time.';

                    if (rejection.status == 404) {
                        message = 'This user no longer exists.';
                    } else if (rejection.status == 412) {
                        message = 'This user has changed since it was loaded.';
                    } else if (rejection.data && rejection.data._issues && rejection.data._issues.username) {
                        var issue = rejection.data._issues.username;

                        if (issue.indexOf('unique') != -1) {
                            message = 'This username already exists. Change the username and try again.';
                        }
                    }

                    toastr.error(message, 'Error Saving User');

                    loadUser();
                }
            );
        };

        function loadUser() {
            var getUser = UserService.getUser($routeParams.userId);

            getUser.$promise.then(
                function() {
                    vm.id = getUser._id;
                    vm.etag = getUser._etag;
                    vm.username = getUser.username;
                    vm.oldUsername = getUser.username;
                    vm.isAdmin = getUser.admin;
                },
                function (rejection) {
                    var message = 'Unable to edit user at this time.';
                    if (rejection.status == 404) {
                        message = 'This user no longer exists.';
                    }
                    toastr.error(message, 'Error Loading User');

                    $location.path('users');
                }
            );
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('ResourceService', ResourceService);

    ResourceService.$inject = ['$resource', '$location'];

    function ResourceService($resource, $location) {

        var url = '//' + $location.host() + ':' + $location.port() + '/api/resources/:resourceId';

        return {
            getResources:   getResources,
            getResource:    getResource,
            addResource:    addResource,
            saveResource:   saveResource,
            removeResource: removeResource
        };


        function getResources(page) {
            var resource = $resource(url);

            return resource.get({ page: page });
        }

        function getResource(id) {
            var resource = $resource(url,
                {
                    resourceId: '@id'
                }
            );

            return resource.get({ resourceId: id });
        }

        function addResource(newResource) {
            var resource = $resource(url);

            return resource.save(newResource);
        }

        function saveResource (id, etag, updates) {
            var resource = $resource(url,
                {
                    resourceId: '@id'
                },
                {
                    save: {
                        method: 'PATCH',
                        headers: { 'If-Match': etag }
                    }
                }
            );

            return resource.save({ resourceId: id }, updates);
        }

        function removeResource(id, etag) {
            var resource = $resource(url,
                {
                    resourceId: '@id'
                },
                {
                    remove: {
                        method: 'DELETE',
                        headers: { 'If-Match': etag }
                    }
                }
            );

            return resource.remove({resourceId: id});
        }
    }

})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('ResourceController', ResourceController);

    ResourceController.$inject = ['toastr', 'ResourceService', 'AuthService'];

    function ResourceController(toastr, ResourceService, AuthService) {
        var vm = this;

        vm.resources = [];

        vm.page = 1;

        loadResources();

        vm.refresh = function refresh() {
            vm.page = 1;
            loadResources();
        };

        vm.next = function next() {
            if (!vm.lastPage) {
                vm.page++;
                loadResources();
            }
        };

        vm.prev = function prev() {
            if (vm.page > 1) {
                vm.page--;
                loadResources();
            }
        };

        vm.removeResource = function removeResource(resource) {
            if (!resource.removing) {
                resource.removing = true;
                var removeResource = ResourceService.removeResource(resource.id, resource._etag);

                removeResource.$promise.then(
                    function () {
                        toastr.success('Resource successfully removed!');

                        if ((vm.resources.length == 1) && (vm.page > 1)) {
                            vm.page--;
                        }

                        loadResources();
                    },
                    function (rejection) {
                        resource.removing = false;

                        var message = 'Unable to remove resource at this time.';

                        if (rejection.status == 404) {
                            message = 'This resource no longer exists.'
                        } else if (rejection.status == 412) {
                            message = 'This resource has changed since it was loaded.';
                        }

                        toastr.error(message, 'Error Removing Resource');

                        loadResources();
                    }
                )
            }
        };

        vm.isAdmin = function isAdmin() {
            return AuthService.isAdmin();
        };

        function loadResources() {
            vm.loading = true;
            vm.errorLoading = false;
            var getResources = ResourceService.getResources(vm.page);

            getResources.$promise.then(
                function () {
                    vm.loading = false;
                    vm.errorLoading = false;
                    vm.resources = getResources._items;

                    vm.lastPage = (getResources._meta.max_results * vm.page) >= getResources._meta.total;
                },

                function () {
                    vm.loading = false;
                    vm.errorLoading = true;
                }
            );
        }
    }
})();
(function() {
    'use strict';

    angular
        .module('app')
        .controller('EditResourceController', EditResourceController);

    EditResourceController.$inject = ['$routeParams', '$location', 'toastr', 'ResourceService'];

    function EditResourceController($routeParams, $location, toastr, ResourceService) {
        var vm = this;

        vm.saving = false;

        loadResource();

        vm.saveResource = function () {
            vm.saving = true;

            var saveResource = ResourceService.saveResource(vm.id, vm.etag, { name: vm.name });

            saveResource.$promise.then(

                function () {
                    toastr.success('Resource saved!');
                    $location.path('resources');
                },

                function (rejection) {
                    vm.saving = false;

                    var message = 'Unable to save resource at this time.';

                    if (rejection.status == 404) {
                        message = 'This resource no longer exists.';
                    } else if (rejection.status == 412) {
                        message = 'This resource has changed since it was loaded.';
                    } else if (rejection.data && rejection.data._issues && rejection.data._issues.name) {
                        var issue = rejection.data._issues.name;

                        if (issue.indexOf('unique') != -1) {
                            message = 'This resource name already exists. Change the name and try again.';
                        }
                    }

                    toastr.error(message, 'Error Saving Resource');

                    loadResource();
                }
            );
        };

        function loadResource() {
            var getResource = ResourceService.getResource($routeParams.resourceId);

            getResource.$promise.then(
                function() {
                    vm.id = getResource._id;
                    vm.etag = getResource._etag;
                    vm.name = getResource.name;
                    vm.oldName = getResource.name;
                },
                function (rejection) {
                    var message = 'Unable to edit resource at this time.';
                    if (rejection.status == 404) {
                        message = 'This resource no longer exists.';
                    }
                    toastr.error(message, 'Error Loading Resource');

                    $location.path('resources');
                }
            );
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .controller('AddResourceController', AddResourceController);

    AddResourceController.$inject = ['$location', 'toastr','ResourceService'];

    function AddResourceController($location, toastr, ResourceService) {
        var vm = this;

        vm.name = '';

        vm.adding = false;

        vm.addResource = function addUser() {
            vm.adding = true;

            var add = ResourceService.addResource({ name: vm.name });

            add.$promise.then(

                function () {
                    toastr.success('Resource successfully added!');
                    $location.path('resources');
                },

                function (rejection) {
                    vm.adding = false;
                    var message = 'Unable add new resource at this time.';

                    if (rejection.data && rejection.data._issues && rejection.data._issues.name)
                    {
                        var issue = rejection.data._issues.name;

                        if (issue.indexOf('unique') != -1) {
                            message = 'This resource name already exists. Change the name and try again.';
                        }
                    }

                    toastr.error(message, 'Error Adding Resource');
                }
            )
        };
    }

})();
(function() {
    'use strict';

    angular
        .module('app')
        .controller('ChangeUserPasswordController', ChangeUserPasswordController);

    ChangeUserPasswordController.$inject = ['$routeParams', '$location', 'toastr', 'UserService', 'AuthService'];

    function ChangeUserPasswordController($routeParams, $location, toastr, UserService, AuthService) {
        var vm = this;

        vm.saving = false;

        loadUser();

        vm.changePassword = function () {
            vm.saving = true;

            var user = {
                password: vm.password
            };

            var saveUser = UserService.saveUser(vm.id, vm.etag, user);

            saveUser.$promise.then(

                function () {
                    toastr.success('Password changed!');

                    if (AuthService.username() == vm.username) {
                        AuthService.saveCredentials(vm.username, vm.password, vm.isAdmin);
                    }

                    $location.path('users');
                },

                function (rejection) {
                    vm.saving = false;

                    var message = 'Unable to change password at this time.';

                    if (rejection.status == 404) {
                        message = 'This user no longer exists.';
                    } else if (rejection.status == 412) {
                        message = 'This user has changed since it was loaded.';
                    }

                    toastr.error(message, 'Error Changing Password');

                    loadUser();
                }
            );
        };

        function loadUser() {
            var getUser = UserService.getUser($routeParams.userId);

            getUser.$promise.then(
                function() {
                    vm.id = getUser._id;
                    vm.etag = getUser._etag;
                    vm.username = getUser.username;
                    vm.isAdmin = getUser.admin;
                },

                function (rejection) {
                    var message = 'Unable to change password at this time.';
                    if (rejection.status == 404) {
                        message = 'This user no longer exists.';
                    }
                    toastr.error(message, 'Error Loading User');

                    $location.path('users');
                }
            );
        }
    }
})();
(function () {
    'use strict';

    angular
        .module('app')
        .factory('CardService', CardService);

    CardService.$inject = ['$resource', '$location'];

    function CardService($resource, $location) {

        var url = '//' + $location.host() + ':' + $location.port() + '/api/cards/:cardId';

        return {
            getCards: getCards,
            getCard: getCard,
            saveCard: saveCard,
            removeCard: removeCard
        };

        function getCards(page) {
            var card = $resource(url);

            return card.get({ page: page });
        }

        function getCard(id) {
            var card = $resource(url,
                {
                    cardId: '@id'
                }
            );

            return card.get({ cardId: id });
        }

        function saveCard (id, etag, updates) {
            var card = $resource(url,
                {
                    cardId: '@id'
                },
                {
                    save: {
                        method: 'PATCH',
                        headers: { 'If-Match': etag }
                    }
                }
            );

            return card.save({ cardId: id }, updates);
        }

        function removeCard(id, etag) {
            var card = $resource(url,
                {
                    cardId: '@id'
                },
                {
                    remove: {
                        method: 'DELETE',
                        headers: { 'If-Match': etag }
                    }
                }
            );

            return card.remove({cardId: id});
        }
    }

})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('CardController', CardController);

    CardController.$inject = ['toastr', 'CardService', 'ResourceService', 'AuthService'];

    function CardController(toastr, CardService, ResourceService, AuthService) {
        var vm = this;

        vm.cards = [];

        vm.resourceNames = {};

        vm.page = 1;

        loadResources();

        vm.refresh = function refresh() {
            vm.page = 1;
            loadResources();
        };

        vm.next = function next() {
            if (!vm.lastPage) {
                vm.page++;
                loadResources();
            }
        };

        vm.prev = function prev() {
            if (vm.page > 1) {
                vm.page--;
                loadResources();
            }
        };

        vm.removeCard = function removeCard(card) {
            if (!card.removing) {
                card.removing = true;

                var removeCard = CardService.removeCard(card.id, card._etag);

                removeCard.$promise.then(
                    function () {
                        toastr.success('Card successfully removed!');

                        if ((vm.cards.length == 1) && (vm.page > 1)) {
                            vm.page--;
                        }

                        loadResources();
                    },
                    function (rejection) {
                        card.removing = false;

                        var message = 'Unable to remove card at this time.';

                        if (rejection.status == 404) {
                            message = 'This card no longer exists.'
                        } else if (rejection.status == 412) {
                            message = 'This card has changed since it was loaded.';
                        }

                        toastr.error(message, 'Error Removing Card');

                        loadResources();
                    }
                );
            }
        };

        vm.isAdmin = function isAdmin() {
            return AuthService.isAdmin();
        };

        function loadCards() {
            var getCards = CardService.getCards(vm.page);

	    // document.write(getCards._meta.max_results);
	    // var maxPage = Math.ceil(getCards._meta.total / getCards._meta.max_results);
	    // vm.lastPage = getCards._meta.max_results;
	    // var getCards = CardService.getCards(vm.lastPage-1);
	    // getCards._meta.total;
	    // try to find max page
	    // var i=1;
	    // var cards = getCards._items;
	    // while (i < 3) {
	    // 	i++;
	    // 	var getCards = CardService.getCards(i);
	    // 	var cards = getCards._items;
	    // 	// document.write(cards.length);
	    // }



            getCards.$promise.then(
                function () {
		    var maxPage = Math.ceil(getCards._meta.total / getCards._meta.max_results);
		    // getCards = CardService.getCards(2);
		    
                    vm.loading = false;

                    var cards = getCards._items;

                    for (var i = 0; i < cards.length; i++) {
                        var resources = cards[i].resources.split(',');
                        cards[i].resources = resources;
                    }
		    // document.write(cards.length)
		    vm.cards = cards.reverse(); // Adam added .reverse
		    
                    vm.lastPage = (getCards._meta.max_results * vm.page) >= getCards._meta.total;
                },

                function () {
                    vm.loading = false;
                    vm.errorLoading = true;
                }
            );
        }

        function loadResources() {
            vm.loading = true;
            vm.errorLoading = false;

            var getResources = ResourceService.getResources();

            getResources.$promise.then(
                function () {
                    var resources = getResources._items;
                    vm.resourceNames = [];
		    
                    for (var i = 0; i < resources.length; i++) {
                        vm.resourceNames[resources[i]._id] = resources[i].name;
			// vm.resourceNames[resources[i]._id] = resources[0].name;
                    }

                    loadCards();
                },

                function () {
                    vm.loading = false;
                    vm.errorLoading = true;
                }
            );
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('app')
        .controller('EditCardController', EditCardController);

    EditCardController.$inject = ['$routeParams', '$location', 'toastr', 'CardService', 'ResourceService'];

    function EditCardController($routeParams, $location, toastr, CardService, ResourceService) {
        var vm = this;

        vm.saving = false;

        loadCard();

        vm.saveCard = function () {
            vm.saving = true;

            var resources = [];

            for (var i = 0; i < vm.resources.length; i++) {
                if (vm.resources[i].isAuthorized) {
                    resources.push(vm.resources[i]._id);
                }
            }

            var card = {
                member:     vm.member,
                resources:  resources.join(',')
            };

            var saveCard = CardService.saveCard(vm.id, vm.etag, card);

            saveCard.$promise.then(

                function () {
                    toastr.success('Card Saved!');
                    $location.path('cards');
                },

                function (rejection) {
                    vm.saving = false;

                    var message = 'Unable to save card at this time.';

                    if (rejection.status == 404) {
                        message = 'This card no longer exists.';
                    } else if (rejection.status == 412) {
                        message = 'This card has changed since it was loaded.';
                    }

                    toastr.error(message, 'Error Saving Card');

                    loadCard();
                }
            );
        };

        function loadCard() {
            var getCard = CardService.getCard($routeParams.cardId);

            getCard.$promise.then(
                function() {
                    vm.id = getCard._id;
                    vm.etag = getCard._etag;
                    vm.uuid = getCard.uuid;
                    vm.member = getCard.member;

                    loadResources(getCard.resources);
                },
                function (rejection) {
                    var message = 'Unable to edit card at this time.';
                    if (rejection.status == 404) {
                        message = 'This card no longer exists.';
                    }
                    toastr.error(message, 'Error Loading Card');

                    $location.path('cards');
                }
            );
        }

        function loadResources(cardResources) {
            var getResources = ResourceService.getResources();

            getResources.$promise.then(
                function () {
                    vm.resources = getResources._items;

                    for (var i = 0; i < vm.resources.length; i++) {
                        if (cardResources.indexOf(vm.resources[i]._id) != -1) {
                            vm.resources[i].isAuthorized = true;
                        } else {
                            vm.resources[i].isAuthorized = false;
                        }
                    }
                },
                function (rejection) {
                    toastr.error('Unable to edit card at this time.', 'Error Loading Card');
                    $location.path('cards');
                }
            );
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app')
        .factory('LogService', LogService);

    LogService.$inject = ['$resource', '$location'];

    function LogService($resource, $location) {

        var url = '//' + $location.host() + ':' + $location.port() + '/api/logs/:logId';

        return {
            getLogs:    getLogs,
            clearLogs:  clearLogs
        };

        function getLogs(page) {
            var log = $resource(url);

            return log.get({ sort: '-_created', page: page });
        }

        function clearLogs() {
            var log = $resource(url);

            return log.remove();
        }
    }

})();

(function () {
    'use strict';

    angular
        .module('app')
        .controller('LogController', LogController);

    LogController.$inject = ['toastr', 'FileSaver', 'Blob', 'LogService', 'AuthService'];

    function LogController(toastr, FileSaver, Blob, LogService, AuthService) {
        var vm = this;

        vm.logs = [];

        vm.page = 1;

        vm.clearing = false;

        loadLogs();

        vm.refresh = function refresh() {
            vm.page = 1;
            loadLogs();
        };

        vm.isAdmin = function isAdmin() {
            return AuthService.isAdmin();
        };

        vm.newer = function newer() {
            if (vm.page > 1) {
                vm.page--;
                loadLogs();
            }
        };

        vm.older = function older() {
            if (!vm.lastPage) {
                vm.page++;
                loadLogs();
            }
        };

        vm.clearLogs = function clearLogs() {
            if (!vm.clearing) {
                vm.clearing = true;

                var clearLogs = LogService.clearLogs();

                clearLogs.$promise.then(
                    function () {
                        vm.clearing = false;
                        toastr.success('Logs cleared!');
                        loadLogs();
                    },

                    function (rejection) {
                        vm.clearing = false;
                        toastr.error('Unable to clear logs at this time.');
                        loadLogs();
                    }
                );
            }
        };

        vm.saveLogs = function saveLogs() {
            var csv = logsToCsv();
            var data = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            FileSaver.saveAs(data, 'rfid_logs.csv');
        };

        function loadLogs() {
            vm.loading = true;
            vm.errorLoading = false;

            var getLogs = LogService.getLogs(vm.page);

            getLogs.$promise.then(
                function () {
                    vm.loading = false;
                    vm.errorLoading = false;

                    vm.logs = getLogs._items;

                    for (var i = 0; i < vm.logs.length; i++) {
                        var d = new Date(vm.logs[i]._created);
                        vm.logs[i].date = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
                    }

                    vm.lastPage = (getLogs._meta.max_results * vm.page) >= getLogs._meta.total ? true : false;
                },

                function () {
                    vm.loading = false;
                    vm.errorLoading = true;
                }
            );
        }

        function logsToCsv() {
            var csv = "Date,UUID,Member,Resource,Status\n"

            for (var i = 0; i < vm.logs.length; i++) {
                var log = vm.logs[i];
                csv +=  log.date                + "," +
                        log.uuid.substr(5)      + "," +
                        log.member              + "," +
                        log.resource            + "," +
                        (log.granted ? 'Success' : log.reason) + "\n";
            }

            return csv;
        }
    }
})();

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
