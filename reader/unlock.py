#!/usr/bin/env python

import requests
import sys

url = 'https://localhost:8443/unlock'
STATUS_OK = 200

def isAllowed(resourceName, uuid):

    data = {
        'resource': resourceName,
        'uuid': uuid
    }

    r = requests.get(url, params=data, verify=False);

    return r.status_code == STATUS_OK

def usage():
    print "Usage: %s resource uuid" % __file__

if __name__ == '__main__':
    if len(sys.argv) != 3:
        usage()
        exit(1)

    resource    = sys.argv[1]
    uuid        = sys.argv[2]

    if isAllowed(resource, uuid):
        print 'Allowed'
        exit(0)
    else:
        print 'Not allowed'
        exit(1)
