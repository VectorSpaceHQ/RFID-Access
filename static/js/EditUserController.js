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