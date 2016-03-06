(function () {
    'use strict';

    angular
        .module('app')
        .factory('LogService', LogService);

    LogService.$inject = ['$resource', '$location'];

    function LogService($resource, $location) {

        var url = '//' + $location.host() + ':' + $location.port() + '/api/logs/:logId';

        return {
            getLogs:    getLogs,
            clearLogs:  clearLogs
        };

        function getLogs(page) {
            var log = $resource(url);

            return log.get({ sort: '-_created', page: page });
        }

        function clearLogs() {
            var log = $resource(url);

            return log.remove();
        }
    }

})();
