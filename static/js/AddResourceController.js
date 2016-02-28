(function () {
    'use strict';

    angular
        .module('app')
        .controller('AddResourceController', AddResourceController);

    AddResourceController.$inject = ['$location', 'ResourceService', 'toastr'];

    function AddResourceController($location, ResourceService, toastr) {
        var vm = this;

        vm.name = '';

        vm.adding = false;

        vm.addResource = function addUser() {
            vm.adding = true;

            var add = ResourceService.addResource({ name: vm.name });

            add.$promise.then(

                function () {
                    toastr.success('Resource added successfully!');
                    $location.path('resources');
                },

                function (rejection) {
                    vm.adding = false;
                    var message = 'Can\'t add new resource at this time.';

                    if (rejection.data && rejection.data._issues && rejection.data._issues.name)
                    {
                        var issue = rejection.data._issues.name;

                        if (issue.indexOf('unique') != -1) {
                            message = 'This resource name already exists. Change the name and try again.';
                        }
                    }

                    toastr.error(message, 'Error Adding Resource');
                }
            )
        };
    }

})();