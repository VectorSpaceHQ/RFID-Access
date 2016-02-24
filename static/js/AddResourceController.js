(function () {
    'use strict';

    angular
        .module('app')
        .controller('AddResourceController', AddResourceController);

    AddResourceController.$inject = ['$location', 'ResourceService'];

    function AddResourceController($location, ResourceService) {
        var vm = this;

        vm.name = '';

        vm.addResource = function addUser() {

            var add = ResourceService.addResource({ name: vm.name });

            add.$promise.then(

                function () {
                    alert('Resource added successfully');
                    $location.path('resources');
                },

                function () {
                    alert('Error adding resource');
                }
            )
        };
    }

})();