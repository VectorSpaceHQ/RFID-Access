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
            vm.loading = true;

            var loginReq = AuthService.loginUser(vm.username, vm.password);

            loginReq.$promise.then(
                function () {
                    AuthService.saveCredentials(vm.username, vm.password, loginReq.admin);
                    $location.path('/');
                },
                function (rejection) {
                    vm.loading = false;

                    var message = 'Unable to login at this time.';

                    if (rejection.status == 401) {
                        message = 'Incorrect username or password';
                    }

                    toastr.error(message,'Login Failed');
                }
            );
        }
    }
})();