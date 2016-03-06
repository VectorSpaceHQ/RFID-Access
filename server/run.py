import sys
import re
import bcrypt
import os
import hashlib
import datetime
import json
import string
import random

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
            and (method == 'GET' or user.admin)

def before_insert_users(items):
    for item in items:
        item["password"] = bcrypt.hashpw(item["password"], bcrypt.gensalt())

def before_update_users(updates, originals):
    if 'password' in updates:
        updates['password'] = bcrypt.hashpw(updates['password'], bcrypt.gensalt())

def delete_resource(item):
    for card in db.session.query(Cards):
        if card.resources:
            resources = card.resources.split(',')
            card.resources = ','.join(filter(lambda a: int(a) != item['id'], resources))
            db.session.commit()

def remove_password(request, payload):
    user_data = json.loads(payload.data)

    if '_items' in user_data:
        for user in user_data['_items']:
            if 'password' in user:
                user.pop('password', None)

        payload.data = json.dumps(user_data)

    elif 'password' in user_data:
        user_data.pop('password', None)
        payload.data = json.dumps(user_data)

def generate_password(size = 10, chars = '!@#$%&*' + string.digits + string.ascii_uppercase + string.ascii_lowercase):
    return ''.join(random.choice(chars) for _ in range(size))


app = Eve(validator=ValidatorSQL, data=SQL, auth=MyBasicAuth)

db = app.data.driver
Base.metadata.bind = db.engine
db.Model = Base
db.create_all()

if not db.session.query(Users).count():
    hash = hashlib.sha1()
    hash.update(datetime.datetime.now().isoformat())
    etag = hash.hexdigest()

    password = generate_password()

    print '@' * 80
    print "No users found in database"
    print "Creating root user with password %s" % password
    print "You should change the root password NOW!"
    print '@' * 80

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
            hash.update(datetime.datetime.now().isoformat())
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

    if 'debug' in sys.argv:
        app.debug = True

    app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
        '/': os.path.join(os.path.dirname(__file__), '..', 'client', 'dist')
    })

    app.on_insert_users += before_insert_users
    app.on_update_users += before_update_users
    app.on_delete_item_resources += delete_resource
    app.on_post_GET_users += remove_password

    context = (
        os.path.join(os.path.dirname(__file__), 'ssl', 'RFID.crt'),
        os.path.join(os.path.dirname(__file__), 'ssl', 'RFID.key')
    )

    port = 443
    if app.debug:
        port = 8443

    app.run(host="0.0.0.0", port=port, ssl_context=context)
