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