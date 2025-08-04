import os
from tables import Users, Resources, Cards, Logs, KeyCodes

# Eve 2.x configuration
SQLALCHEMY_DATABASE_URI = 'sqlite:////' + os.path.join(os.path.dirname(__file__), 'rfid.db')
SQLALCHEMY_ECHO = False
SQLALCHEMY_RECORD_QUERIES = False
SQLALCHEMY_TRACK_MODIFICATIONS = False

RESOURCE_METHODS = ['GET', 'POST']
ITEM_METHODS = ['GET', 'PATCH', 'PUT', 'DELETE']
CACHE_CONTROL = 'no-cache'
URL_PREFIX = 'api'

DEBUG = False

PAGINATION_DEFAULT = 500
PAGINATION_LIMIT = 500

# Define schemas manually for Eve 2.x
DOMAIN = {
    'users': {
        'schema': {
            'username': {'type': 'string', 'required': True, 'unique': True},
            'password': {'type': 'string', 'required': True},
            'admin': {'type': 'boolean', 'default': False},
            '_created': {'type': 'datetime'},
            '_updated': {'type': 'datetime'},
            '_etag': {'type': 'string'}
        },
        'public_methods': [''],
        'public_item_methods': [''],
        'additional_lookup': {
            'url': 'regex("[\\w ]+")',
            'field': 'username'
        }
    },
    'resources': {
        'schema': {
            'name': {'type': 'string', 'required': True, 'unique': True},
            '_created': {'type': 'datetime'},
            '_updated': {'type': 'datetime'},
            '_etag': {'type': 'string'}
        },
        'additional_lookup': {
            'url': 'regex("[\\w ]+")',
            'field': 'name'
        }
    },
    'cards': {
        'schema': {
            'uuid': {'type': 'string', 'required': True, 'unique': True},
            'uuid_bin': {'type': 'string', 'required': True, 'unique': True},
            'member': {'type': 'string'},
            'resources': {'type': 'string'},
            '_created': {'type': 'datetime'},
            '_updated': {'type': 'datetime'},
            '_etag': {'type': 'string'}
        },
        'additional_lookup': {
            'url': 'regex("uuid-[\\d]+")',
            'field': 'uuid'
        }
    },
    'logs': {
        'schema': {
            'uuid': {'type': 'string'},
            'uuid_bin': {'type': 'string'},
            'member': {'type': 'string'},
            'resource': {'type': 'string'},
            'granted': {'type': 'boolean'},
            'reason': {'type': 'string'},
            '_created': {'type': 'datetime'},
            '_updated': {'type': 'datetime'},
            '_etag': {'type': 'string'}
        },
        'resource_methods': ['GET', 'POST', 'DELETE']
    },
    'keycodes': {
        'schema': {
            'name': {'type': 'string'},
            'code': {'type': 'string', 'required': True, 'unique': True},
            'start_date': {'type': 'date'},
            'end_date': {'type': 'date'},
            'daily_start_time': {'type': 'time'},
            'daily_end_time': {'type': 'time'},
            'resource': {'type': 'string'},
            'granted': {'type': 'boolean'},
            'reason': {'type': 'string'},
            '_created': {'type': 'datetime'},
            '_updated': {'type': 'datetime'},
            '_etag': {'type': 'string'}
        },
        'additional_lookup': {
            'url': 'regex("[\\d]+")',
            'field': 'code'
        }
    }
}
