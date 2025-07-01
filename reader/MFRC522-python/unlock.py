#!/usr/bin/env python

import requests
import sys

url = 'https://localhost/unlock'
STATUS_OK = 200
# session = requests.Session()


# This function is currently too slow
def isAllowed(session, resourceName, uuid, uuid_bin):

    data = {
        'resource': resourceName,
        'uuid': uuid,
        'uuid_bin': uuid_bin
    }

    if (resourceName == "Lobby"):
        r = session.get(url, params=data, verify=False);
    else:
        r = session.get(url, params=data, verify=False);

    return r.status_code == STATUS_OK

def usage(name):
    print("Usage: {} resource uuid".format(name))

if __name__ == '__main__':
    if len(sys.argv) != 3:
        usage(sys.argv[0])
        exit(1)

    resource    = sys.argv[1]
    uuid        = sys.argv[2]

    if isAllowed(resource, uuid):
        print('Allowed')
        exit(0)
    else:
        print('Not allowed')
        exit(1)
