(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'AuthService'];

    function LoginController($location, AuthService) {
        var vm = this;

        AuthService.clearCredentials();

        vm.username = '';
        vm.password = '';

        vm.login = function() {
            var loginReq = AuthService.loginUser(vm.username, vm.password);

            loginReq.$promise.then(
                function () {
                    AuthService.saveCredentials(vm.username, vm.password);
                    $location.path('/');
                },
                function () {
                    alert('Login failed. Incorrect username or password.');
                }
            );
        }
    }
})();