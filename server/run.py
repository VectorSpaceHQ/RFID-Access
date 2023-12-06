import sys
import re
import bcrypt
import os
import hashlib
import datetime
import time
import json
import string
import random

from eve import Eve
from eve.auth import TokenAuth
from flask import redirect, make_response, request, jsonify
from werkzeug.wsgi import SharedDataMiddleware
from eve_sqlalchemy import SQL
from eve_sqlalchemy.validation import ValidatorSQL
from tables import Users, Resources, Cards, Logs, Tokens, Base

class MyTokenAuth(TokenAuth):
    def check_auth(self, token, allowed_roles, resource, method):
        sessionToken = db.session.query(Tokens).filter(Tokens.token == token).first()

        if sessionToken:
            if time.time() < sessionToken.expires:
                return (method == 'GET' or sessionToken.admin)
            else:
                db.session.query(Tokens).filter(Tokens.expires < time.time()).delete()
                db.session.commit()
                return False
        else:
            return False

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
    user_data = json.loads(payload.data.decode('utf-8'))

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

def prune_database():
    """
    Delete all cards with _created date greater than 24 hours AND member NULL
    """
    from datetime import timedelta, datetime
    print("pruning")
    for card in db.session.query(Cards):
        time_diff = datetime.now() - card._created 
        if time_diff.days >= 1:
            if card.member == "":
                print("Remove card {} from database".format(card.id))
                db.session.query(Cards).filter(Cards.id == card.id).delete()
                db.session.commit()

    
app = Eve(validator=ValidatorSQL, data=SQL, auth=MyTokenAuth)

db = app.data.driver
Base.metadata.bind = db.engine
db.Model = Base
db.create_all()

if not db.session.query(Users).count():
    hash = hashlib.sha1()
    hash.update(datetime.datetime.now().isoformat())
    etag = hash.hexdigest()

    password = generate_password()

    print('@' * 80)
    print("No users found in database")
    print("Creating root user with password %s" % password)
    print("You should change the root password NOW!")
    print('@' * 80)

    password = bcrypt.hashpw(password, bcrypt.gensalt())

    db.session.add(Users(username='root', password=password, admin=True, _etag=etag))
    db.session.commit()


@app.route('/')
def root():
    prune_database()
    return redirect("/index.html")

@app.route('/auth', methods=['POST'])
def auth():
    unauthorized = make_response('', 401)

    data = request.get_json()

    username = ''
    if 'username' in data:
        username = data['username']

    password = ''
    if 'password' in data:
        password = data['password']

    user = db.session.query(Users).filter(Users.username == username).first()

    if user and bcrypt.checkpw(password, user.password):
        hash = hashlib.sha1()
        hash.update(os.urandom(128))

        token = hash.hexdigest()

        db.session.add(Tokens(token = hash.hexdigest(), admin = user.admin, expires =  int(time.time()) + 3600))
        db.session.commit()

        return jsonify({
            "token" : token,
            "admin" : user.admin
        })
    else:
        return unauthorized

@app.route('/unlock')
def unlock():
    unauthorized = make_response('', 401)
    ok = make_response('', 200)

    # resourceName = request.args.get('resource') or ''
    # force name of 1 for rear door
    # resourceName = 'Front Door'
    resourceName = request.args.get('resource')
    print("unlock request at " + resourceName)
    uuid = request.args.get('uuid') or '0'
    uuid = 'uuid-' + uuid
    uuid_bin = request.args.get('uuid_bin') or '0'
    uuid_bin = uuid_bin

    allowed = False

    log = Logs()

    log.uuid = uuid
    log.uuid_bin = uuid_bin
    log.resource = resourceName
    log.member = ''
    log.reason = ''

    # wiegand_one = uuid_bin[17:25] + uuid_bin[9:17] # big white
    # wiegand_two = uuid_bin[9:17] + uuid_bin[17:25] # small blue

    # allcards = db.session.query(Cards)
    # for onecard in allcards:
    #     print(onecard.uuid, onecard.uuid_bin)
    # print("Cards.uuid", Cards.uuid)
    # print("wiegand_one", wiegand_one)
    # print("wiegand_two", wiegand_two)

    # card = db.session.query(Cards).filter(Cards.uuid_bin == uuid_bin).first()
    card = db.session.query(Cards).filter(Cards.uuid == uuid_bin).first()

    # cards = db.session.query(Cards).all()
    # for c in cards:
    #     print(c.uuid_bin, c.uuid)


    # ADAM 9/12/20
    # 10000000100111000000001001 wallet
    # (u'Adam Spontarelli', 296, u'uuid-8507210', u'0101010100000000000001111101001010000000') keys
    # Should be able to replace 3 readings with the following one
    # card = db.session.query(Cards).filter(Cards.uuid_bin == uuid_bin).first()


    # -----------------------------------------
    # Adam removing 11/16/23
    # This code was meant to keep old keys working. Time to remove it
    #-
    # if card:
    #     if card.member:
    #         print("card found in system")
    #         print(card.member, uuid_bin, card.uuid_bin, log.uuid_bin)
    # else:
    #     print("card NOT found in system")
    #     card_wiegand_one = db.session.query(Cards).filter(Cards.uuid_bin.like("%"+str(wiegand_one)+"%")).first()
    #     if card_wiegand_one:
    #         if card_wiegand_one.member:
    #             print("\nWIEGAND ONE FOUND\n")
    #             card = card_wiegand_one
    #             log.uuid_bin = wiegand_one
    #             print(card.member, uuid_bin, card.uuid_bin, log.uuid_bin)

    #             print("Modifying uuid_bin")
    #             card.uuid_bin = uuid_bin
    #     else:
    #         card_wiegand_two = db.session.query(Cards).filter(Cards.uuid_bin.like("%"+str(wiegand_two)+"%")).first()
    #         if card_wiegand_two:
    #             if card_wiegand_two.member:
    #                 print("\nWIEGAND TWO FOUND\n")
    #                 card = card_wiegand_two
    #                 log.uuid_bin = wiegand_two
    # -----------------------------------------                    

    # print(card.member, card.id, card.uuid, card.uuid_bin)

    if card:
        print("card found in system")
        print(card.member, uuid_bin, card.uuid_bin, log.uuid_bin, log.resource)
        log.member = card.member

        # resource = db.session.query(Resources).filter(Resources.name == resourceName).first()
        resource = db.session.query(Resources).filter(Resources.name == "Front Door").first()
        if resource:
            for id in card.resources.split(','):
                # print("id:",id)
                # print("resource.id:", resource.id) # 1= front door

                if id and int(id) == resource.id:
                    allowed = True
                    # if uuid_wiegand null, add it
                    # if card.uuid_wiegand == None:
                    #     print("\nNO WIEGAND\n")
                    #     card.uuid_wiegand = uuid_bin
                    #     print("wiegand added")
                    break

            if not allowed:
                log.reason = 'Card Unauthorized'
                print("card UNAUTH")
        else:
            log.reason = 'Resource Not Found'
            print("RESOURCE NOT FIND TRY AGAIN")
    else:
        log.reason = 'Card Not Found'

        if uuid != 'uuid-0':
            print("adding key to cards list")
            hash = hashlib.sha1()
            hash.update(datetime.datetime.now().isoformat())
            etag = hash.hexdigest()

            print("logging uuid_bin, uuid, uuid_bin...")
            print(log.uuid_bin, uuid, uuid_bin, etag)
            # card = Cards(uuid=,uuid_bin, member, resources)
            db.session.add(Cards(uuid=uuid_bin, uuid_bin=uuid_bin, member='', resources='', _etag=etag))
            print("add finished")
            db.session.commit()
            print("commit finished")


    log.granted = allowed
    print("logging...")
    db.session.add(log)
    print("logging finished")
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
