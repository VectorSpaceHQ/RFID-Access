(function () {
    'use strict';

    angular
        .module('app')
        .controller('CardController', CardController);

    CardController.$inject = ['CardService', 'ResourceService', 'AuthService'];

    function CardController(CardService, ResourceService, AuthService) {
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

        vm.isAdmin = function isAdmin() {
            return AuthService.isAdmin();
        };

        function loadCards() {
            var getCards = CardService.getCards();

            getCards.$promise.then(
                function () {
                    var cards = getCards._items;
                    for (var i = 0; i < cards.length; i++) {
                        var resources = cards[i].resources.split(',');
                        cards[i].resources = resources;
                    }
                    vm.cards = cards;
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
