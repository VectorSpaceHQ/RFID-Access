(function() {
    'use strict';

    angular
        .module('app')
        .controller('EditCardController', EditCardController);

    EditCardController.$inject = ['$routeParams', '$location', 'CardService', 'ResourceService'];

    function EditCardController($routeParams, $location, CardService, ResourceService) {
        var vm = this;

        loadCard();

        vm.saveCard = function () {

            var resources = [];

            for (var i = 0; i < vm.resources.length; i++) {
                if (vm.resources[i].isAuthorized) {
                    resources.push(vm.resources[i]._id);
                }
            }

            var card = {
                member:     vm.member,
                resources:  resources.join(',')
            };

            var saveCard = CardService.saveCard(vm.id, vm.etag, card);

            saveCard.$promise.then(

                function () {
                    alert('Card saved.');
                    $location.path('cards');
                },

                function () {
                    alert('Unable to save changes.');
                    loadCard();
                }
            );
        };

        function loadCard() {
            var getCard = CardService.getCard($routeParams.cardId);

            getCard.$promise.then(
                function() {
                    vm.id = getCard._id;
                    vm.etag = getCard._etag;
                    vm.uuid = getCard.uuid;
                    vm.member = getCard.member;

                    loadResources(getCard.resources);
                }
            );
        }

        function loadResources(cardResources) {
            var getResources = ResourceService.getResources();

            getResources.$promise.then(
                function () {
                    vm.resources = getResources._items;

                    for (var i = 0; i < vm.resources.length; i++) {
                        if (cardResources.indexOf(vm.resources[i]._id) != -1) {
                            vm.resources[i].isAuthorized = true;
                        } else {
                            vm.resources[i].isAuthorized = false;
                        }
                    }
                }
            );
        }
    }
})();