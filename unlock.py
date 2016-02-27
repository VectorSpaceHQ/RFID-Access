#!/usr/bin/env python

import requests
import sys

apiUrl = 'http://localhost:8080/api'
STATUS_OK = 200

def isAllowed(resourceName, uuid):
    allowed = False

    log = {
        'uuid': 'uuid-%s' % (uuid),
        'resource': resourceName,
        'member': '',
        'reason': ''
    }

    r = requests.get('%s/resources/%s' % (apiUrl, resourceName));

    if r.status_code == STATUS_OK:
        resource = r.json()
        r = requests.get('%s/cards/uuid-%s' % (apiUrl, uuid));

        if r.status_code == STATUS_OK:
            card = r.json()

            if 'member' in card:
                log.update({ 'member': card['member'] })

            for id in card['resources'].split(','):
                if str(id) == str(resource['_id']):
                    allowed = True
                    break

            if not allowed:
                log.update({ 'reason': 'Card Unauthorized' })
        else:
            log.update({ 'reason': 'Card Not Found' })
    else:
        log.update({ 'reason': 'Resource Not Found' })

    log.update({ 'granted' : allowed })

    r = requests.post('%s/logs' % apiUrl, json = log, auth = ('user', 'password'))

    return allowed

def usage(name):
    print "Usage: %s resource uuid" % name

if __name__ == '__main__':
    if len(sys.argv) != 3:
        usage(sys.argv[0])
        exit(1)

    resource    = sys.argv[1]
    uuid        = sys.argv[2]

    if isAllowed(resource, uuid):
        print 'Allowed'
        exit(0)
    else:
        print 'Not allowed'
        exit(1)
