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

        vm.removeResource = function removeResource(id, etag) {
            var removeResource = ResourceService.removeResource(id, etag);

            removeResource.$promise.then(
                function () {
                    toastr.success('Resource successfully removed!');
                    loadResources();
                },
                function (rejection) {
                    var message = 'Unable to remove resource at this time.';

                    if (rejection.status == 404) {
                        message = 'This resource no longer exists.'
                    } else if (rejection.status == 412) {
                        message = 'This resource has changed since it was loaded.';
                    } else if (rejection.data && rejection.data._issues && rejection.data._issues.name) {
                        var issue = rejection.data._issues.name;

                        if (issue.indexOf('unique') != -1) {
                            message = 'This resource name already exists. Change the name and try again.';
                        }
                    }

                    toastr.error(message, 'Error Removing Resource');

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