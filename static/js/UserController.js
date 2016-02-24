(function () {
    'use strict';

    angular
        .module('app')
        .controller('UserController', UserController);

    UserController.$inject = ['UserService'];

    function UserController(UserService) {
        var vm = this;

        vm.users = [];

        loadUsers();

        vm.removeUser = function removeUser(id, etag) {
            var removeUser = UserService.removeUser(id, etag);

            removeUser.$promise.then(
                function () {
                    loadUsers();
                }
            )
        }

        function loadUsers() {
            var getUsers = UserService.getUsers();

            getUsers.$promise.then(
                function () {
                    vm.users = getUsers._items;
                }
            );
        }
    }



})();