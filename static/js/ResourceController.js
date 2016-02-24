(function () {
    'use strict';

    angular
        .module('app')
        .controller('ResourceController', ResourceController);

    ResourceController.$inject = ['ResourceService'];

    function ResourceController(ResourceService) {
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
        }

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