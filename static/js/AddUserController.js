(function () {
    'use strict';

    angular
        .module('app')
        .controller('AddUserController', AddUserController);

    AddUserController.$inject = ['$location', 'UserService'];

    function AddUserController($location, UserService) {
        var vm = this;

        vm.username = '';
        vm.password = '';
        vm.isAdmin = false;

        vm.addUser = function addUser() {
            var roles = ['user'];

            if (vm.isAdmin) {
                roles.push('admin');
            }

            var add = UserService.addUser({
                username:   vm.username,
                password:   vm.password,
                roles:      roles
            });

            add.$promise.then(

                function () {
                    alert('User added successfully');
                    $location.path('users');
                },

                function () {
                    alert('Error adding user');
                }
            )
        };
    }

})();