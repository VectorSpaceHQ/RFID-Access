(function() {
    'use strict';

    angular
        .module('app')
        .controller('EditCardController', EditCardController);

    EditCardController.$inject = ['$routeParams', '$location', 'toastr', 'CardService', 'ResourceService'];

    function EditCardController($routeParams, $location, toastr, CardService, ResourceService) {
        var vm = this;

        vm.saving = false;

        loadCard();

        vm.saveCard = function () {
            vm.saving = true;

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
                    toastr.success('Card Saved!');
                    $location.path('cards');
                },

                function (rejection) {
                    vm.saving = false;

                    var message = 'Unable to save card at this time.';

                    if (rejection.status == 404) {
                        message = 'This card no longer exists.';
                    } else if (rejection.status == 412) {
                        message = 'This card has changed since it was loaded.';
                    }

                    toastr.error(message, 'Error Saving Card');

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
                },
                function (rejection) {
                    var message = 'Unable to edit card at this time.';
                    if (rejection.status == 404) {
                        message = 'This card no longer exists.';
                    }
                    toastr.error(message, 'Error Loading Card');

                    $location.path('cards');
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
                },
                function (rejection) {
                    toastr.error('Unable to edit card at this time.', 'Error Loading Card');
                    $location.path('cards');
                }
            );
        }
    }
})();
