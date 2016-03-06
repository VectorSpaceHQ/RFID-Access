(function () {
    'use strict';

    angular
        .module('app')
        .controller('IndexController', IndexController);

    IndexController.$inject = ['$location', 'AuthService'];

    function IndexController($location, AuthService) {
        var vm = this;

        vm.logout = function () {
            $location.url('/login');
        };

        vm.isLoggedIn = function () {
            return AuthService.isLoggedIn();
        };
    }

})();