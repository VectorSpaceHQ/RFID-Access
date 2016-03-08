(function () {
    'use strict';

    angular
        .module('app')
        .factory('CardService', CardService);

    CardService.$inject = ['$resource', '$location'];

    function CardService($resource, $location) {

        var url = '//' + $location.host() + ':' + $location.port() + '/api/cards/:cardId';

        return {
            getCards: getCards,
            getCard: getCard,
            saveCard: saveCard,
            removeCard: removeCard
        };

        function getCards(page) {
            var card = $resource(url);

            return card.get({ page: page });
        }

        function getCard(id) {
            var card = $resource(url,
                {
                    cardId: '@id'
                }
            );

            return card.get({ cardId: id });
        }

        function saveCard (id, etag, updates) {
            var card = $resource(url,
                {
                    cardId: '@id'
                },
                {
                    save: {
                        method: 'PATCH',
                        headers: { 'If-Match': etag }
                    }
                }
            );

            return card.save({ cardId: id }, updates);
        }

        function removeCard(id, etag) {
            var card = $resource(url,
                {
                    cardId: '@id'
                },
                {
                    remove: {
                        method: 'DELETE',
                        headers: { 'If-Match': etag }
                    }
                }
            );

            return card.remove({cardId: id});
        }
    }

})();
