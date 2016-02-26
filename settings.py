import os
from eve_sqlalchemy.decorators import registerSchema
from tables import Users, Resources, Cards

registerSchema('users')(Users)
registerSchema('resources')(Resources)
registerSchema('cards')(Cards)

SQLALCHEMY_DATABASE_URI = 'sqlite:////' + os.path.join(os.path.dirname(__file__), 'rfid.db')

SQLALCHEMY_ECHO = True
SQLALCHEMY_RECORD_QUERIES = True
RESOURCE_METHODS = ['GET', 'POST']
ITEM_METHODS = ['GET', 'PATCH', 'PUT', 'DELETE']
CACHE_CONTROL = 'no-cache'
URL_PREFIX = 'api'

DEBUG = True

DOMAIN = {
    'users':        Users._eve_schema['users'],
    'resources':    Resources._eve_schema['resources'],
    'cards':        Cards._eve_schema['cards']
}

DOMAIN['resources'].update({
    'additional_lookup': {
        'url':      'regex("[\w]+")',
        'field':    'name'
    }
})

DOMAIN['cards'].update({
    'additional_lookup': {
        'url':      'regex("uuid-[\d]+")',
        'field':    'uuid'
    }
})
