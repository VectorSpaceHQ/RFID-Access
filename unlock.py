#!/usr/bin/env python

import requests
import sys

apiUrl = 'http://localhost:8080/api'
STATUS_OK = 200

def isAllowed(resourceName, serialNo):
   allowed = False

   r = requests.get('%s/resources/%s' % (apiUrl, resourceName));

   if r.status_code == STATUS_OK:
      resource = r.json()
      r = requests.get('%s/cards/%s' % (apiUrl, serialNo));

      if r.status_code == STATUS_OK:
         card = r.json()

         for id in card['resources'].split(','):
            if id == resource['_id']:
               allowed = True
               break

   return allowed

def usage(name):
   print "Usage: %s resource serialNo" % name

if __name__ == '__main__':
   if len(sys.argv) != 3:
      usage(sys.argv[0])
      exit(1)

   resource = sys.argv[1]
   serialNo = sys.argv[2]

   if isAllowed(resource, serialNo):
      print 'Allowed'
      exit(0)
   else:
      print 'Not allowed'
      exit(1)
