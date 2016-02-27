(function () {
    'use strict';

    angular
        .module('app')
        .controller('ResourceController', ResourceController);

    ResourceController.$inject = ['ResourceService', 'AuthService'];

    function ResourceController(ResourceService, AuthService) {
        var vm = this;

        vm.resources = [];

        loadResources();

        vm.removeResource = function removeResource(id, etag) {
            var removeResource = ResourceService.removeResource(id, etag);

            removeResource.$promise.then(
                function () {
                    loadResources();
                }
            )
        };

        vm.isAdmin = function isAdmin() {
            return AuthService.isAdmin();
        };

        function loadResources() {
            var getResources = ResourceService.getResources();

            getResources.$promise.then(
                function () {
                    vm.resources = getResources._items;
                }
            );
        }
    }



})();