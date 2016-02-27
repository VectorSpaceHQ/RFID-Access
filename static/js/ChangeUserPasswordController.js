(function() {
    'use strict';

    angular
        .module('app')
        .controller('ChangeUserPasswordController', ChangeUserPasswordController);

    ChangeUserPasswordController.$inject = ['$routeParams', 'UserService'];

    function ChangeUserPasswordController($routeParams, UserService) {
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
                    alert('Password changed.');
                    loadUser();
                },

                function () {
                    vm.saving = false;
                    alert('Unable to change password.');
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
                }
            );
        }
    }
})();