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

                    AuthService.saveCredentials(vm.username, vm.password, vm.isAdmin);

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