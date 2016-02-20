import re
from eve import Eve

settings = {
   'DOMAIN' : {
      'users' : {
         'schema': {
            'username': {
               'type': 'string',
               'required': True
            },

            'password': {
               'type': 'string',
               'required': True
            },

            'roles': {
               'type': 'list',
               'allowed': ["user", "admin"]
            }
         }
      },

      'members': {
         'schema': {
            'first_name': {
               'type': 'string',
               'required': True
            },

            'last_name': {
               'type': 'string',
               'required': True
            },

            'card_id': {
               'type': 'string',
               'required': True
            }
         },
      },

      'cards': {
         'schema': {
            'id': {
               'type': 'string',
               'required': True,
               'unique': True
            }
         },

         'additional_lookup': {
            'url': 'regex("[\w]+")',
            'field': 'id'
         }
      }
   },

   'RESOURCE_METHODS' : ['GET', 'POST'],

   'ITEM_METHODS' : ['GET', 'PATCH', 'PUT', 'DELETE'],

   'DEBUG' : True
}

def post_get_callback(resource, request, payload):

   match = re.search('/cards/(\w+)$', request.path)

   if (payload.status_code == 404) and match:

      card_id = match.group(1)

      cards = app.data.driver.db['cards']

      card = cards.find_one({ 'id': card_id })

      if not card:
         app.data.driver.db['cards'].insert({ 'id': card_id })


if __name__ == '__main__':
   app = Eve(settings=settings)

   app.on_post_GET += post_get_callback

   app.run()
