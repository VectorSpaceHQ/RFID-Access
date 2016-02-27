(function() {
    'use strict';

    angular
        .module('app')
        .controller('EditUserController', EditUserController);

    EditUserController.$inject = ['$routeParams', '$location', 'UserService'];

    function EditUserController($routeParams, $location, UserService) {
        var vm = this;

        vm.saving = false;

        loadUser();

        vm.saveUser = function () {

            vm.saving = true;

            var user = {
                username:   vm.username,
                admin:      vm.isAdmin
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
                    vm.saving = false;
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
                }
            );
        }
    }
})();