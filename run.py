import re
import bcrypt
import os
import hashlib
import datetime

from eve import Eve
from eve.auth import BasicAuth
from flask import redirect
from werkzeug.wsgi import SharedDataMiddleware
from eve_sqlalchemy import SQL
from eve_sqlalchemy.validation import ValidatorSQL
from tables import Users, Resources, Cards, Logs, Base

class MyBasicAuth(BasicAuth):
    def check_auth(self, username, password, allowed_roles, resource, method):
        user = db.session.query(Users).filter(Users.username == username).first()
        return  user and bcrypt.checkpw(password, user.password) and (method == 'GET' or user.admin)

def post_get_callback(resource, request, payload):

    match = re.search('/cards/(uuid-\w+)$', request.path)

    if (payload.status_code == 404) and match:

        uuid = match.group(1)

        card = db.session.query(Cards).filter(Cards.uuid == uuid).first()

        if not card:
            hash = hashlib.sha1()
            hash.update(uuid)
            etag = hash.hexdigest()

            db.session.add(Cards(uuid=uuid, member='', resources='', _etag=etag))
            db.session.commit()


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

if __name__ == '__main__':

   app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
       '/': os.path.join(os.path.dirname(__file__), 'static')
   })

   app.on_post_GET += post_get_callback
   app.on_insert_users += before_insert_users
   app.on_update_users += before_update_users

   app.run(host="0.0.0.0", port=8080)
