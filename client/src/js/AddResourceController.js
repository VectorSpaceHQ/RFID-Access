(function () {
    'use strict';

    angular
        .module('app')
        .controller('AddResourceController', AddResourceController);

    AddResourceController.$inject = ['$location', 'toastr','ResourceService'];

    function AddResourceController($location, toastr, ResourceService) {
        var vm = this;

        vm.name = '';

        vm.adding = false;

        vm.addResource = function addUser() {
            vm.adding = true;

            var add = ResourceService.addResource({ name: vm.name });

            add.$promise.then(

                function () {
                    toastr.success('Resource successfully added!');
                    $location.path('resources');
                },

                function (rejection) {
                    vm.adding = false;
                    var message = 'Unable add new resource at this time.';

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