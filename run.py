import re
import bcrypt
import os
import hashlib

from eve import Eve
from flask import redirect
from werkzeug.wsgi import SharedDataMiddleware
from eve_sqlalchemy import SQL
from eve_sqlalchemy.validation import ValidatorSQL
from tables import Users, Resources, Cards, Base

def post_get_callback(resource, request, payload):

    match = re.search('/cards/(uuid-\w+)$', request.path)

    if (payload.status_code == 404) and match:
        print "Card not found"

        uuid = match.group(1)

        card = db.session.query(Cards).filter(Cards.uuid == uuid).first()

        if not card:
            print "Adding card"
            etag = hashlib.sha1().update(uuid).hexdigest()
            db.session.add(Cards(uuid=uuid, resources='', _etag=etag))
            db.session.commit()


def before_insert_users(items):
    for i in range(len(items)):
        items[i]['password'] = bcrypt.hashpw(items[i]['password'], bcrypt.gensalt())

def before_update_users(updates, originals):
    if 'password' in updates:
        updates['password'] = bcrypt.hashpw(updates['password'], bcrypt.gensalt())

app = Eve(validator=ValidatorSQL, data=SQL)

db = app.data.driver
Base.metadata.bind = db.engine
db.Model = Base
db.create_all()

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
