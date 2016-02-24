(function () {
    'use strict';

    angular
        .module('app')
        .controller('CardController', CardController);

    CardController.$inject = ['CardService', 'ResourceService'];

    function CardController(CardService, ResourceService) {
        var vm = this;

        vm.cards = [];

        vm.resourceNames = {};

        loadResources();

        vm.removeCard = function removeCard(id, etag) {
            var removeCard = CardService.removeCard(id, etag);

            removeCard.$promise.then(
                function () {
                    loadCards();
                }
            )
        };

        function loadCards() {
            var getCards = CardService.getCards();

            getCards.$promise.then(
                function () {
                    vm.cards = getCards._items;
                }
            );
        }

        function loadResources() {
            var getResources = ResourceService.getResources();

            getResources.$promise.then(
                function () {
                    var resources = getResources._items;
                    for (var i = 0; i < resources.length; i++) {
                        vm.resourceNames[resources[i]._id] = resources[i].name;
                    }

                    loadCards();
                }
            );
        }
    }
})();
