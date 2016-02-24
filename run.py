import re
import bcrypt
import os
from eve import Eve
from flask import redirect
from werkzeug.wsgi import SharedDataMiddleware

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

   'URL_PREFIX' : 'api',

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

def before_update_users(updates, originals):
   if 'password' in updates:
      updates['password'] = bcrypt.hashpw(updates['password'], bcrypt.gensalt());

app = Eve(settings=settings)

@app.route('/')
def root():
    return redirect("/index.html");

if __name__ == '__main__':

   app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
       '/': os.path.join(os.path.dirname(__file__), 'static')
   })

   app.on_post_GET += post_get_callback
   app.on_insert_users += before_insert_users
   app.on_update_users += before_update_users

   app.run(host="0.0.0.0", port=8080)
