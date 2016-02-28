(function () {
    'use strict';

    angular
        .module('app')
        .controller('AddResourceController', AddResourceController);

    AddResourceController.$inject = ['$location', 'ResourceService'];

    function AddResourceController($location, ResourceService) {
        var vm = this;

        vm.name = '';

        vm.adding = false;

        vm.addResource = function addUser() {
            vm.adding = true;

            var add = ResourceService.addResource({ name: vm.name });

            add.$promise.then(

                function () {
                    alert('Resource added successfully');
                    $location.path('resources');
                },

                function (rejection) {
                    vm.adding = false;
                    var message = 'Can\'t add new resource at this time'
                    var issue = rejection.data._issues.name;
                    if (issue.indexOf('unique') != -1) {
                        message = 'This resource name already exists. Change the name and try again.';
                    }
                    alert(message);
                }
            )
        };
    }

})();