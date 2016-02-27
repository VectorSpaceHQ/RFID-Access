(function () {
    'use strict';

    angular
        .module('app')
        .controller('UserController', UserController);

    UserController.$inject = ['UserService', 'AuthService'];

    function UserController(UserService, AuthService) {
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
        };

        vm.isAdmin = function isAdmin() {
            return AuthService.isAdmin();
        };

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