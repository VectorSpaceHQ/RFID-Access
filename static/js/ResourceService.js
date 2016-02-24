(function () {
    'use strict';

    angular
        .module('app')
        .factory('ResourceService', ResourceService);

    ResourceService.$inject = ['$resource', '$location'];

    function ResourceService($resource, $location) {

        var url = '//' + $location.host() + ':' + $location.port() + '/api/resources/:resourceId';

        return {
            getResources:   getResources,
            getResource:    getResource,
            addResource:    addResource,
            saveResource:   saveResource,
            removeResource: removeResource
        };


        function getResources() {
            var resource = $resource(url);

            return resource.get();
        }

        function getResource(id) {
            var resource = $resource(url,
                {
                    resourceId: '@id'
                }
            );

            return resource.get({ resourceId: id });
        }

        function addResource(newResource) {
            var resource = $resource(url);

            return resource.save(newResource);
        }

        function saveResource (id, etag, updates) {
            var resource = $resource(url,
                {
                    resourceId: '@id'
                },
                {
                    save: {
                        method: 'PATCH',
                        headers: { 'If-Match': etag }
                    }
                }
            );

            return resource.save({ resourceId: id }, updates);
        }

        function removeResource(id, etag) {
            var resource = $resource(url,
                {
                    resourceId: '@id'
                },
                {
                    remove: {
                        method: 'DELETE',
                        headers: { 'If-Match': etag }
                    }
                }
            );

            return resource.remove({resourceId: id});
        }
    }

})();
