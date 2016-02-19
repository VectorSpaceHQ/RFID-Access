
DOMAIN = {
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
      }
   }
}

RESOURCE_METHODS = ['GET', 'POST']
ITEM_METHODS = ['GET', 'PATCH', 'PUT', 'DELETE']

DEBUG = True
