import re
import bcrypt
from eve import Eve

settings = {
   'DOMAIN' : {
      'users' : {
         'schema': {
            'username': {
               'type': 'string',
               'minlength': 1,
               'unique': True,
               'required': True
            },

            'password': {
               'type': 'string',
               'minlength': 1,
               'required': True
            },

            'roles': {
               'type': 'list',
               'allowed': ["user", "admin"],
               'required': True
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

   'X_DOMAINS' : '*',

   'X_HEADERS' : ['If-Match', 'Content-Type'],

   'CACHE_CONTROL' : 'no-cache',

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

def before_insert_users(items):
   for i in range(len(items)):
      items[i]['password'] = bcrypt.hashpw(items[i]['password'], bcrypt.gensalt());

if __name__ == '__main__':
   app = Eve(settings=settings)

   app.on_post_GET += post_get_callback
   app.on_insert_users += before_insert_users

   app.run(host="0.0.0.0", port=8080)
