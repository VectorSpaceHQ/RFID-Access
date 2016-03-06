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