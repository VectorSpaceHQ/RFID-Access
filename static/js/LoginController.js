(function () {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$location', 'AuthService', 'toastr'];

    function LoginController($location, AuthService, toastr) {
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
                    toastr.error('Incorrect username or password','Login Failed');
                    vm.loading = false;
                }
            );
        }
    }
})();