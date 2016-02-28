(function () {
    'use strict';

    angular
        .module('app')
        .controller('LogController', LogController);

    LogController.$inject = ['toastr', 'LogService', 'AuthService'];

    function LogController(toastr, LogService, AuthService) {
        var vm = this;

        vm.logs = [];

        loadLogs();

        vm.refresh = function refresh() {
            loadLogs();
        };

        vm.isAdmin = function isAdmin() {
            return AuthService.isAdmin();
        };

        vm.clearLogs = function clearLogs() {
            var clearLogs = LogService.clearLogs();

            clearLogs.$promise.then(
                function () {
                    toastr.success('Logs cleared!');
                    loadLogs();
                },

                function (rejection) {
                    toastr.error('Unable to clear logs at this time.');
                    loadLogs();
                }
            );
        };

        function loadLogs() {
            vm.loading = true;
            var getLogs = LogService.getLogs();

            getLogs.$promise.then(
                function () {
                    vm.loading = false;

                    vm.logs = getLogs._items;

                    for (var i = 0; i < vm.logs.length; i++) {
                        var d = new Date(vm.logs[i]._created);
                        vm.logs[i].date = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
                    }
                },

                function () {
                    vm.loading = false;
                }
            );
        }
    }
})();
