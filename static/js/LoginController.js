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
        vm.loading = false;

        vm.login = function() {
            vm.loading = true
            var loginReq = AuthService.loginUser(vm.username, vm.password);

            loginReq.$promise.then(
                function () {
                    AuthService.saveCredentials(vm.username, vm.password, loginReq.admin);
                    $location.path('/');
                },
                function () {
                    alert('Login failed. Incorrect username or password.');
                    vm.loading = false;
                }
            );
        }
    }
})();