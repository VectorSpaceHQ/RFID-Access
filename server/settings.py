import os
from eve_sqlalchemy.decorators import registerSchema
from tables import Users, Resources, Cards, Logs

registerSchema('users')(Users)
registerSchema('resources')(Resources)
registerSchema('cards')(Cards)
registerSchema('logs')(Logs)
registerSchema('keycodes')(Keycodes)

SQLALCHEMY_DATABASE_URI         = 'sqlite:////' + os.path.join(os.path.dirname(__file__), 'rfid.db')
SQLALCHEMY_ECHO                 = False
SQLALCHEMY_RECORD_QUERIES       = False
SQLALCHEMY_TRACK_MODIFICATIONS  = False

RESOURCE_METHODS                = ['GET', 'POST']
ITEM_METHODS                    = ['GET', 'PATCH', 'PUT', 'DELETE']
CACHE_CONTROL                   = 'no-cache'
URL_PREFIX                      = 'api'

DEBUG = False

PAGINATION_DEFAULT = 500
PAGINATION_LIMIT = 500

DOMAIN = {
    'users':        Users._eve_schema['users'],
    'resources':    Resources._eve_schema['resources'],
    'cards':        Cards._eve_schema['cards'],
    'logs':         Logs._eve_schema['logs'],
    'keycodes':     Keycodes._eve_schema['keycodes']
}

DOMAIN['users'].update({
    'public_methods': [''],
    'public_item_methods': [''],
    'additional_lookup': {
        'url':      'regex("[\w ]+")',
        'field':    'username'
    }
})

DOMAIN['resources'].update({
    'additional_lookup': {
        'url':      'regex("[\w ]+")',
        'field':    'name'
    }
})

DOMAIN['cards'].update({
    'additional_lookup': {
        'url':      'regex("uuid-[\d]+")',
        'field':    'uuid'
    }
})

DOMAIN['keycodes'].update({
    'additional_lookup': {
        'url':      'regex("[\d]+")',
        'field':    'code'
    }
})

DOMAIN['logs'].update({
    'resource_methods': ['GET', 'POST', 'DELETE']
})
