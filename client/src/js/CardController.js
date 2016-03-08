(function () {
    'use strict';

    angular
        .module('app')
        .controller('CardController', CardController);

    CardController.$inject = ['toastr', 'CardService', 'ResourceService', 'AuthService'];

    function CardController(toastr, CardService, ResourceService, AuthService) {
        var vm = this;

        vm.cards = [];

        vm.resourceNames = {};

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

        vm.removeCard = function removeCard(card) {
            if (!card.removing) {
                card.removing = true;

                var removeCard = CardService.removeCard(card.id, card._etag);

                removeCard.$promise.then(
                    function () {
                        toastr.success('Card successfully removed!');

                        if ((vm.cards.length == 1) && (vm.page > 1)) {
                            vm.page--;
                        }

                        loadResources();
                    },
                    function (rejection) {
                        card.removing = false;

                        var message = 'Unable to remove card at this time.';

                        if (rejection.status == 404) {
                            message = 'This card no longer exists.'
                        } else if (rejection.status == 412) {
                            message = 'This card has changed since it was loaded.';
                        }

                        toastr.error(message, 'Error Removing Card');

                        loadResources();
                    }
                );
            }
        };

        vm.isAdmin = function isAdmin() {
            return AuthService.isAdmin();
        };

        function loadCards() {
            var getCards = CardService.getCards(vm.page);

            getCards.$promise.then(
                function () {
                    vm.loading = false;

                    var cards = getCards._items;
                    for (var i = 0; i < cards.length; i++) {
                        var resources = cards[i].resources.split(',');
                        cards[i].resources = resources;
                    }
                    vm.cards = cards;

                    vm.lastPage = (getCards._meta.max_results * vm.page) >= getCards._meta.total;
                },

                function () {
                    vm.loading = false;
                    vm.errorLoading = true;
                }
            );
        }

        function loadResources() {
            vm.loading = true;
            vm.errorLoading = false;

            var getResources = ResourceService.getResources();

            getResources.$promise.then(
                function () {
                    var resources = getResources._items;
                    vm.resourceNames = [];
                    for (var i = 0; i < resources.length; i++) {
                        vm.resourceNames[resources[i]._id] = resources[i].name;
                    }

                    loadCards();
                },

                function () {
                    vm.loading = false;
                    vm.errorLoading = true;
                }
            );
        }
    }
})();
