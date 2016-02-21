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

      'resources': {
         'schema': {
            'name': {
               'type': 'string',
               'required': True
            }
         }
      },

      'cards': {
         'schema': {
            'serialno': {
               'type': 'string',
               'required': True,
               'unique': True
            },

            'authorized_resources':  {
               'type': 'list',
               'required': True
            },

            'member': {
               'type': 'string',
               'required': False
            }

         },

         'additional_lookup': {
            'url': 'regex("[\w]+")',
            'field': 'serialno'
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

      serialno = match.group(1)

      cards = app.data.driver.db['cards']

      card = cards.find_one({ 'serialno': serialno })

      if not card:
         app.data.driver.db['cards'].insert({ 'serialno': serialno, 'authorized_resources': [] })


if __name__ == '__main__':
   app = Eve(settings=settings)

   app.on_post_GET += post_get_callback

   app.run()
