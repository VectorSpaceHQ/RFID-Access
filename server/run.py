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

from flask import Flask, redirect, make_response, request, jsonify
from werkzeug.middleware.shared_data import SharedDataMiddleware
from flask_sqlalchemy import SQLAlchemy
from tables import Users, Resources, Cards, Logs, Tokens, KeyCodes, Base

# Simple token authentication
def check_auth(token, allowed_roles, resource, method):
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
        item["password"] = bcrypt.hashpw(item["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def before_update_users(updates, originals):
    if 'password' in updates:
        updates['password'] = bcrypt.hashpw(updates['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

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

    
# Flask configuration
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rfid.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy()
db.init_app(app)

with app.app_context():
    # Create all tables
    Base.metadata.create_all(db.engine)

    if not db.session.query(Users).count():
        hash = hashlib.sha1()
        hash.update(datetime.datetime.now().isoformat().encode('utf-8'))
        etag = hash.hexdigest()

        password = generate_password()

        print('@' * 80)
        print("No users found in database")
        print("Creating root user with password %s" % password)
        print("You should change the root password NOW!")
        print('@' * 80)

        password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

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

    if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
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

    keycode = request.args.get('code') or '0'

    allowed = False

    log = Logs()

    log.uuid = uuid
    log.uuid_bin = uuid_bin
    log.resource = resourceName
    log.member = ''
    log.reason = ''


    card = db.session.query(Cards).filter(Cards.uuid == uuid_bin).first()
    code = db.session.query(KeyCodes).filter(KeyCodes.code == keycode).first()

    if code:
        print("keycode found in system")

        # if not expired
        # allowed = True

    if card:
        print("card found in system")
        print(card.member, uuid_bin, card.uuid_bin, log.uuid_bin, log.resource)
        log.member = card.member

        # resource = db.session.query(Resources).filter(Resources.name == resourceName).first()
        resource = db.session.query(Resources).filter(Resources.name == "Front Door").first()
        if resource:
            for id in card.resources.split(','):
                if id and int(id) == resource.id:
                    allowed = True
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

    # In development mode, proxy to Angular dev server
    if app.debug:
        from flask_cors import CORS
        CORS(app)  # Enable CORS for development
        
        # Proxy to Angular dev server for frontend requests
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_angular(path):
            if path.startswith('api/') or path.startswith('auth') or path.startswith('unlock'):
                # Let Flask handle API routes
                return app.view_functions.get(path.split('/')[0])(path)
            
            # Proxy to Angular dev server for frontend routes
            import requests
            try:
                angular_response = requests.get(f'http://localhost:4200/{path}')
                return angular_response.content, angular_response.status_code, angular_response.headers.items()
            except requests.exceptions.ConnectionError:
                return f"""
                <html>
                <head><title>Angular Dev Server Not Running</title></head>
                <body>
                <h1>Angular Development Server Not Running</h1>
                <p>Please start the Angular development server:</p>
                <pre>cd client && npm start</pre>
                <p>Then refresh this page.</p>
                </body>
                </html>
                """, 503
    else:
        # Production mode - serve built Angular app
        app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
            '/': os.path.join(os.path.dirname(__file__), '..', 'client', 'dist')
        })

    # Add API routes for CRUD operations
    @app.route('/api/users', methods=['GET'])
    def get_users():
        users = db.session.query(Users).all()
        return jsonify({
            '_items': [{
                'id': user.id,
                'username': user.username,
                'admin': user.admin,
                '_created': user._created.isoformat() if user._created else None,
                '_updated': user._updated.isoformat() if user._updated else None,
                '_etag': user._etag
            } for user in users],
            '_meta': {
                'max_results': len(users),
                'total': len(users)
            }
        })

    @app.route('/api/users', methods=['POST'])
    def create_user():
        data = request.get_json()
        user = Users(
            username=data['username'],
            password=bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
            admin=data.get('admin', False)
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({'id': user.id, 'username': user.username, 'admin': user.admin}), 201

    @app.route('/api/resources', methods=['GET'])
    def get_resources():
        resources = db.session.query(Resources).all()
        return jsonify({
            '_items': [{
                'id': resource.id,
                'name': resource.name,
                'description': '',  # Add description field for compatibility
                '_created': resource._created.isoformat() if resource._created else None,
                '_updated': resource._updated.isoformat() if resource._updated else None,
                '_etag': resource._etag
            } for resource in resources],
            '_meta': {
                'max_results': len(resources),
                'total': len(resources)
            }
        })

    @app.route('/api/resources', methods=['POST'])
    def create_resource():
        data = request.get_json()
        resource = Resources(name=data['name'])
        db.session.add(resource)
        db.session.commit()
        return jsonify({'id': resource.id, 'name': resource.name}), 201

    @app.route('/api/cards', methods=['GET'])
    def get_cards():
        cards = db.session.query(Cards).all()
        return jsonify({
            '_items': [{
                'id': card.id,
                'uuid': card.uuid,
                'uuid_bin': card.uuid_bin,
                'member': card.member,
                'resources': card.resources,
                '_created': card._created.isoformat() if card._created else None,
                '_updated': card._updated.isoformat() if card._updated else None,
                '_etag': card._etag
            } for card in cards],
            '_meta': {
                'max_results': len(cards),
                'total': len(cards)
            }
        })

    @app.route('/api/logs', methods=['GET'])
    def get_logs():
        logs = db.session.query(Logs).all()
        return jsonify({
            '_items': [{
                'id': log.id,
                'uuid': log.uuid,
                'uuid_bin': log.uuid_bin,
                'member': log.member,
                'resource': log.resource,
                'granted': log.granted,
                'reason': log.reason,
                '_created': log._created.isoformat() if log._created else None,
                '_updated': log._updated.isoformat() if log._updated else None,
                '_etag': log._etag
            } for log in logs],
            '_meta': {
                'max_results': len(logs),
                'total': len(logs)
            }
        })

    @app.route('/api/logs', methods=['DELETE'])
    def clear_logs():
        db.session.query(Logs).delete()
        db.session.commit()
        return '', 204

    if app.debug:
        # Development mode - no SSL
        port = 8443
        app.run(host="0.0.0.0", port=port)
    else:
        # Production mode - with SSL
        context = (
            os.path.join(os.path.dirname(__file__), 'ssl', 'RFID.crt'),
            os.path.join(os.path.dirname(__file__), 'ssl', 'RFID.key')
        )
        port = 443
        app.run(host="0.0.0.0", port=port, ssl_context=context)
