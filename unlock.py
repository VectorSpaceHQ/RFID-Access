#!/usr/bin/env python

import requests
import sys

apiUrl = 'http://localhost:8080/api'
STATUS_OK = 200

def isAllowed(resourceName, uuid):
   allowed = False

   r = requests.get('%s/resources/%s' % (apiUrl, resourceName));

   if r.status_code == STATUS_OK:
      resource = r.json()
      r = requests.get('%s/cards/%s' % (apiUrl, uuid));

      if r.status_code == STATUS_OK:
         card = r.json()

         for id in card['resources'].split(','):
            if id == resource['_id']:
               allowed = True
               break

   return allowed

def usage(name):
   print "Usage: %s resource uuid" % name

if __name__ == '__main__':
   if len(sys.argv) != 3:
      usage(sys.argv[0])
      exit(1)

   resource = sys.argv[1]
   uuid     = sys.argv[2]

   if isAllowed(resource, uuid):
      print 'Allowed'
      exit(0)
   else:
      print 'Not allowed'
      exit(1)
