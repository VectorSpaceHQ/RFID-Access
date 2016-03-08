(function () {
    'use strict';

    angular
        .module('app')
        .controller('UserController', UserController);

    UserController.$inject = ['toastr', 'UserService', 'AuthService'];

    function UserController(toastr, UserService, AuthService) {
        var vm = this;

        vm.users = [];

        loadUsers();

        vm.refresh = function refresh() {
            loadUsers();
        };

        vm.removeUser = function removeUser(user) {
            if (!user.removing) {
                user.removing = true;

                var removeUser = UserService.removeUser(user.id, user._etag);

                removeUser.$promise.then(
                    function () {
                        toastr.success('User successfully removed!');
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

            var getUsers = UserService.getUsers();

            getUsers.$promise.then(
                function () {
                    vm.loading = false;
                    vm.errorLoading = false;
                    vm.users = getUsers._items;
                },

                function () {
                    vm.loading = false;
                    vm.errorLoading = true;
                }
            );
        }
    }
})();