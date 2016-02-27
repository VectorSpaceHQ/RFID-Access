(function () {
    'use strict';

    angular
        .module('app')
        .factory('LogService', LogService);

    LogService.$inject = ['$resource', '$location'];

    function LogService($resource, $location) {

        var url = '//' + $location.host() + ':' + $location.port() + '/api/logs/:logId';

        return {
            getLogs: getLogs,
        };

        function getLogs() {
            var log = $resource(url);

            return log.get();
        }
    }

})();
