(function () {
    'use strict';

    angular
        .module('app')
        .controller('ResourceController', ResourceController);

    ResourceController.$inject = ['toastr', 'ResourceService', 'AuthService'];

    function ResourceController(toastr, ResourceService, AuthService) {
        var vm = this;

        vm.resources = [];

        loadResources();

        vm.refresh = function refresh() {
            loadResources();
        };

        vm.removeResource = function removeResource(resource) {
            if (!resource.removing) {
                resource.removing = true;
                var removeResource = ResourceService.removeResource(resource.id, resource._etag);

                removeResource.$promise.then(
                    function () {
                        toastr.success('Resource successfully removed!');
                        loadResources();
                    },
                    function (rejection) {
                        resource.removing = false;

                        var message = 'Unable to remove resource at this time.';

                        if (rejection.status == 404) {
                            message = 'This resource no longer exists.'
                        } else if (rejection.status == 412) {
                            message = 'This resource has changed since it was loaded.';
                        }

                        toastr.error(message, 'Error Removing Resource');

                        loadResources();
                    }
                )
            }
        };

        vm.isAdmin = function isAdmin() {
            return AuthService.isAdmin();
        };

        function loadResources() {
            vm.loading = true;
            vm.errorLoading = false;
            var getResources = ResourceService.getResources();

            getResources.$promise.then(
                function () {
                    vm.loading = false;
                    vm.errorLoading = false;
                    vm.resources = getResources._items;
                },

                function () {
                    vm.loading = false;
                    vm.errorLoading = true;
                }
            );
        }
    }



})();