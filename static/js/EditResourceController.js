(function() {
    'use strict';

    angular
        .module('app')
        .controller('EditResourceController', EditResourceController);

    EditResourceController.$inject = ['$routeParams', '$location', 'ResourceService'];

    function EditResourceController($routeParams, $location, ResourceService) {
        var vm = this;

        vm.saving = false;

        loadResource();

        vm.saveResource = function () {
            vm.saving = true;

            var saveResource = ResourceService.saveResource(vm.id, vm.etag, { name: vm.name });

            saveResource.$promise.then(

                function () {
                    alert('Resource saved.');
                    $location.path('resources');
                },

                function () {
                    vm.saving = false;
                    alert('Unable to save changes.');
                    loadResource();
                }
            );
        };

        function loadResource() {
            var getResource = ResourceService.getResource($routeParams.resourceId);

            getResource.$promise.then(
                function() {
                    vm.id = getResource._id;
                    vm.etag = getResource._etag;
                    vm.name = getResource.name;
                }
            );
        }
    }
})();