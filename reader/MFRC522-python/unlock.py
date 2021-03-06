#!/usr/bin/env python

import requests
import sys

url = 'https://localhost/unlock'
STATUS_OK = 200

def isAllowed(resourceName, uuid):

    data = {
        'resource': resourceName,
        'uuid': uuid
    }

    r = requests.get(url, params=data, verify=False);

    return r.status_code == STATUS_OK

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
