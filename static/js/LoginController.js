(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['AuthService'];

    function LoginController(AuthService) {
        var vm = this;

        vm.username = '';
        vm.password = '';

        vm.login = function() {
            var loginReq = AuthService.loginUser(vm.username, vm.password);

            loginReq.$promise.then(
                function () {
                },
                function () {
                    alert('Login failed. Incorrect username or password');
                }
            );
        }
    }
})();