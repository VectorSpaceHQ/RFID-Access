(function() {
    'use strict';

    angular
        .module('app')
        .controller('EditResourceController', EditResourceController);

    EditResourceController.$inject = ['$routeParams', '$location', 'toastr', 'ResourceService'];

    function EditResourceController($routeParams, $location, toastr, ResourceService) {
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

                function (rejection) {
                    vm.saving = false;

                    var message = 'Unable to save resource at this time.';

                    if (rejection.status == 404) {
                        message = 'This resource no longer exists.';
                    } else if (rejection.status == 412) {
                        message = 'This resource has changed since it was loaded.';
                    } else if (rejection.data && rejection.data._issues && rejection.data._issues.name) {
                        var issue = rejection.data._issues.name;

                        if (issue.indexOf('unique') != -1) {
                            message = 'This resource name already exists. Change the name and try again.';
                        }
                    }

                    toastr.error(message, 'Error Saving Resource');

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
                    vm.oldName = getResource.name;
                },
                function (rejection) {
                    var message = 'Unable to edit resource at this time.';
                    if (rejection.status == 404) {
                        message = 'This resource no longer exists.';
                    }
                    toastr.error(message, 'Error Loading Resource');

                    $location.path('resources');
                }
            );
        }
    }
})();