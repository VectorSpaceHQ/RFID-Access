(function () {
    'use strict';

    angular
        .module('app')
        .controller('ResourceController', ResourceController);

    ResourceController.$inject = ['toastr', 'ResourceService', 'AuthService'];

    function ResourceController(toastr, ResourceService, AuthService) {
        var vm = this;

        vm.resources = [];

        vm.page = 1;

        loadResources();

        vm.refresh = function refresh() {
            vm.page = 1;
            loadResources();
        };

        vm.next = function next() {
            if (!vm.lastPage) {
                vm.page++;
                loadResources();
            }
        };

        vm.prev = function prev() {
            if (vm.page > 1) {
                vm.page--;
                loadResources();
            }
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
            var getResources = ResourceService.getResources(vm.page);

            getResources.$promise.then(
                function () {
                    vm.loading = false;
                    vm.errorLoading = false;
                    vm.resources = getResources._items;

                    vm.lastPage = (getResources._meta.max_results * vm.page) >= getResources._meta.total;
                },

                function () {
                    vm.loading = false;
                    vm.errorLoading = true;
                }
            );
        }
    }
})();