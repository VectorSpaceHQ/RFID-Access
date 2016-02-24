#!/usr/bin/env python

import sys
import bcrypt
from pymongo import MongoClient

def addUser(db, username, password, roles):
   client = MongoClient()

   db = client[dbname]

   users = db.users

   user = users.insert_one({
      'username': username,
      'password': bcrypt.hashpw(password, bcrypt.gensalt()),
      'roles': roles 
   })

def usage(name):
   print "Usage: %s dbname username password role1 role2 ... roleN" % name

if __name__ == '__main__':

   if len(sys.argv) < 5:
      usage(sys.argv[0])
      exit(1)

   dbname   = sys.argv[1]
   username = sys.argv[2]
   password = sys.argv[3]
   roles    = sys.argv[4:]

   addUser(dbname, username, password, roles)
