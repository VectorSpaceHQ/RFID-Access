(function () {
    'use strict';

    angular
        .module('app')
        .controller('LogController', LogController);

    LogController.$inject = ['LogService', 'AuthService'];

    function LogController(LogService, AuthService) {
        var vm = this;

        vm.logs = [];

        loadLogs();

        vm.isAdmin = function isAdmin() {
            return AuthService.isAdmin();
        };

        function loadLogs() {
            var getLogs = LogService.getLogs();

            getLogs.$promise.then(
                function () {
                    vm.logs = getLogs._items;

                    for (var i = 0; i < vm.logs.length; i++) {
                        var d = new Date(vm.logs[i]._created);
                        vm.logs[i].date = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
                    }
                }
            );
        }
    }



})();
