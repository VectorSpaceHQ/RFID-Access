(function() {
    'use strict';

    angular
        .module('app')
        .controller('EditUserController', EditUserController);

    EditUserController.$inject = ['$routeParams', '$location', 'UserService'];

    function EditUserController($routeParams, $location, UserService) {
        var vm = this;

        loadUser();

        vm.saveUser = function () {

            var roles = ['user'];
            if (vm.isAdmin) {
                roles.push('admin');
            }

            var user = {
                username: vm.username,
                roles: roles
            };

            var saveUser = UserService.saveUser(vm.id, vm.etag, user);

            saveUser.$promise.then(

                function () {
                    alert('User saved.');
                    $location.path('users');
                },

                function () {
                    alert('Unable to save changes.');
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
                    vm.isAdmin = getUser.roles.indexOf('admin') != -1;
                }
            );
        }
    }
})();