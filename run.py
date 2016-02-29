import re
import bcrypt
import os
import hashlib
import datetime

from eve import Eve
from eve.auth import BasicAuth
from flask import redirect, make_response, request
from werkzeug.wsgi import SharedDataMiddleware
from eve_sqlalchemy import SQL
from eve_sqlalchemy.validation import ValidatorSQL
from tables import Users, Resources, Cards, Logs, Base

class MyBasicAuth(BasicAuth):
    def check_auth(self, username, password, allowed_roles, resource, method):
        user = db.session.query(Users).filter(Users.username == username).first()
        return  user \
            and bcrypt.checkpw(password, user.password) \
            and (method == 'GET' \
                    or user.admin \
                    or (resource == 'logs'and method != 'DELETE'))

def before_insert_users(items):
    for item in items:
        item["password"] = bcrypt.hashpw(item["password"], bcrypt.gensalt())

def before_update_users(updates, originals):
    if 'password' in updates:
        updates['password'] = bcrypt.hashpw(updates['password'], bcrypt.gensalt())

app = Eve(validator=ValidatorSQL, data=SQL, auth=MyBasicAuth)

db = app.data.driver
Base.metadata.bind = db.engine
db.Model = Base
db.create_all()

if not db.session.query(Users).count():
    hash = hashlib.sha1()
    hash.update(datetime.datetime.now().isoformat())
    etag = hash.hexdigest()

    hash.update(etag)
    password = hash.hexdigest()

    print "No users found in database"
    print "Creating root user with password %s" % password
    print "You should change the root password NOW!"

    password = bcrypt.hashpw(password, bcrypt.gensalt())

    db.session.add(Users(username='root', password=password, admin=True, _etag=etag))
    db.session.commit()


@app.route('/')
def root():
    return redirect("/index.html");

@app.route('/unlock')
def unlock():
    unauthorized = make_response('', 401)
    ok = make_response('', 200)

    resourceName = request.args.get('resource') or ''
    uuid = request.args.get('uuid') or '0'
    uuid = 'uuid-' + uuid

    allowed = False

    log = Logs()

    log.uuid = uuid
    log.resource = resourceName
    log.member = ''
    log.reason = ''

    card = db.session.query(Cards).filter(Cards.uuid == uuid).first()

    if card:

        log.member = card.member

        resource = db.session.query(Resources).filter(Resources.name == resourceName).first()

        if resource:
            for id in card.resources.split(','):
                if int(id) == resource.id:
                    allowed = True
                    break;

            if not allowed:
                log.reason = 'Card Unauthorized'
        else:
            log.reason = 'Resource Not Found'
    else:
        log.reason = 'Card Not Found'

        if uuid != 'uuid-0':
            hash = hashlib.sha1()
            hash.update(uuid)
            etag = hash.hexdigest()

            db.session.add(Cards(uuid=uuid, member='', resources='', _etag=etag))
            db.session.commit()

    log.granted = allowed

    db.session.add(log)
    db.session.commit()

    if allowed:
        return ok
    else:
        return unauthorized

if __name__ == '__main__':

   app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
       '/': os.path.join(os.path.dirname(__file__), 'static')
   })

   app.on_insert_users += before_insert_users
   app.on_update_users += before_update_users

   app.run(host="0.0.0.0", port=8080)
