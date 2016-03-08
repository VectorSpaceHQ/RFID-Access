(function () {
    'use strict';

    angular
        .module('app')
        .factory('UserService', UserService);

    UserService.$inject = ['$resource', '$location'];

    function UserService($resource, $location) {

        var url = '//' + $location.host() + ':' + $location.port() + '/api/users/:userId';

        return {
            getUsers: getUsers,
            getUser: getUser,
            addUser: addUser,
            saveUser: saveUser,
            removeUser: removeUser
        };

        function getUsers(page) {
            var user = $resource(url);

            return user.get({ page: page });
        }

        function getUser(id) {
            var user = $resource(url,
                {
                    userId: '@id'
                }
            );

            return user.get({ userId: id });
        }

        function addUser(newUser) {
            var user = $resource(url);

            return user.save(newUser);
        }

        function saveUser (id, etag, updates) {
            var user = $resource(url,
                {
                    userId: '@id'
                },
                {
                    save: {
                        method: 'PATCH',
                        headers: { 'If-Match': etag }
                    }
                }
            );

            return user.save({ userId: id }, updates);
        }

        function removeUser(id, etag) {
            var user = $resource(url,
                {
                    userId: '@id'
                },
                {
                    remove: {
                        method: 'DELETE',
                        headers: { 'If-Match': etag }
                    }
                }
            );

            return user.remove({userId: id});
        }
    }

})();
