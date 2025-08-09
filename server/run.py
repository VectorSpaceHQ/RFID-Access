import sys
import re
import bcrypt
import os
import hashlib
import datetime
import time
import json
import uuid
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

def get_current_time():
    return datetime.datetime.now()

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

    # Lightweight migration: ensure new columns exist on 'logs' table
    try:
        with db.engine.connect() as conn:
            # Check existing columns
            result = conn.execute(db.text("PRAGMA table_info('logs')"))
            existing_cols = {row[1] for row in result}
            if 'code' not in existing_cols:
                conn.execute(db.text("ALTER TABLE logs ADD COLUMN code VARCHAR(256)"))
            if 'name' not in existing_cols:
                conn.execute(db.text("ALTER TABLE logs ADD COLUMN name VARCHAR(256)"))
            # Migrate resources.type
            result = conn.execute(db.text("PRAGMA table_info('resources')"))
            res_cols = {row[1] for row in result}
            if 'type' not in res_cols:
                conn.execute(db.text("ALTER TABLE resources ADD COLUMN type VARCHAR(16) DEFAULT 'Reader'"))
    except Exception as e:
        print(f"Warning: could not verify/migrate logs table columns: {e}")

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
        from flask import send_from_directory
        
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_angular(path):
            if path.startswith('api/') or path.startswith('auth') or path.startswith('unlock'):
                # Let Flask handle API routes
                return app.view_functions.get(path.split('/')[0])(path)
            
            # Serve Angular static files
            angular_path = os.path.join(os.path.dirname(__file__), '..', 'client', 'dist', 'vs-rfid-client')
            if path and os.path.exists(os.path.join(angular_path, path)):
                return send_from_directory(angular_path, path)
            else:
                return send_from_directory(angular_path, 'index.html')

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

    @app.route('/api/users/<int:user_id>', methods=['GET'])
    def get_user(user_id):
        user = db.session.query(Users).filter(Users.id == user_id).first()
        if user:
            return jsonify({
                'id': user.id,
                'username': user.username,
                'admin': user.admin,
                '_created': user._created.isoformat() if user._created else None,
                '_updated': user._updated.isoformat() if user._updated else None,
                '_etag': user._etag
            })
        else:
            return jsonify({'error': 'User not found'}), 404

    @app.route('/api/users/<int:user_id>', methods=['PATCH'])
    def update_user(user_id):
        user = db.session.query(Users).filter(Users.id == user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Check if username already exists (excluding current user)
        if 'username' in data:
            existing_user = db.session.query(Users).filter(
                Users.username == data['username'],
                Users.id != user_id
            ).first()
            if existing_user:
                return jsonify({'error': 'Username already exists'}), 409
        
        # Update fields
        if 'username' in data:
            user.username = data['username']
        if 'admin' in data:
            user.admin = data['admin']
        if 'password' in data:
            user.password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        db.session.commit()
        return jsonify({
            'id': user.id,
            'username': user.username,
            'admin': user.admin,
            '_etag': user._etag
        })

    @app.route('/api/users/<int:user_id>', methods=['DELETE'])
    def delete_user(user_id):
        user = db.session.query(Users).filter(Users.id == user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        db.session.delete(user)
        db.session.commit()
        return '', 204

    @app.route('/api/resources', methods=['GET'])
    def get_resources():
        resources = db.session.query(Resources).all()
        return jsonify({
            '_items': [{
                'id': resource.id,
                'name': resource.name,
                'description': '',  # kept for compatibility
                'type': getattr(resource, 'type', 'Reader'),
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
        resource = Resources(
            name=data['name'],
            type=data.get('type', 'Reader')
        )
        db.session.add(resource)
        db.session.commit()
        return jsonify({'id': resource.id, 'name': resource.name, 'description': '', 'type': resource.type}), 201

    @app.route('/api/resources/<int:resource_id>', methods=['GET'])
    def get_resource(resource_id):
        resource = db.session.get(Resources, resource_id)
        if not resource:
            return jsonify({'_error': 'Resource not found'}), 404
        return jsonify({
            'id': resource.id,
            'name': resource.name,
            # description field is not present in the DB schema; keep API compatible
            'description': '',
            'type': getattr(resource, 'type', 'Reader'),
            '_created': resource._created.isoformat() if resource._created else None,
            '_updated': resource._updated.isoformat() if resource._updated else None,
            '_etag': resource._etag
        })

    @app.route('/api/resources/<int:resource_id>', methods=['PATCH'])
    def update_resource(resource_id):
        resource = db.session.get(Resources, resource_id)
        if not resource:
            return jsonify({'_error': 'Resource not found'}), 404
        
        # Check ETag for concurrency control
        if_match = request.headers.get('If-Match')
        if if_match and if_match.strip('"') != resource._etag:
            return jsonify({'_error': 'Resource has been modified'}), 412
        
        data = request.get_json()
        
        # Check for duplicate name
        if 'name' in data and data['name'] != resource.name:
            existing = db.session.query(Resources).filter_by(name=data['name']).first()
            if existing:
                return jsonify({'_error': 'Resource name already exists'}), 409
        
        # Update fields
        if 'name' in data:
            resource.name = data['name']
        # description is not stored; ignore if provided
        if 'type' in data and data['type'] in ['Keypad','Reader']:
            resource.type = data['type']
        
        resource._updated = get_current_time()
        resource._etag = str(uuid.uuid4())
        
        db.session.commit()
        return jsonify({
            'id': resource.id,
            'name': resource.name,
            'description': '',
            'type': getattr(resource, 'type', 'Reader'),
            '_created': resource._created.isoformat() if resource._created else None,
            '_updated': resource._updated.isoformat() if resource._updated else None,
            '_etag': resource._etag
        })

    @app.route('/api/resources/<int:resource_id>', methods=['DELETE'])
    def delete_resource(resource_id):
        resource = db.session.get(Resources, resource_id)
        if not resource:
            return jsonify({'_error': 'Resource not found'}), 404
        
        # Check ETag for concurrency control
        if_match = request.headers.get('If-Match')
        if if_match and if_match.strip('"') != resource._etag:
            return jsonify({'_error': 'Resource has been modified'}), 412
        
        db.session.delete(resource)
        db.session.commit()
        return '', 204

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

    @app.route('/api/cards/<int:card_id>', methods=['GET'])
    def get_card(card_id):
        card = db.session.get(Cards, card_id)
        if not card:
            return jsonify({'_error': 'Card not found'}), 404
        return jsonify({
            'id': card.id,
            'uuid': card.uuid,
            'uuid_bin': card.uuid_bin,
            'member': card.member,
            'resources': card.resources,
            '_created': card._created.isoformat() if card._created else None,
            '_updated': card._updated.isoformat() if card._updated else None,
            '_etag': card._etag
        })

    @app.route('/api/cards/<int:card_id>', methods=['PATCH'])
    def update_card(card_id):
        card = db.session.get(Cards, card_id)
        if not card:
            return jsonify({'_error': 'Card not found'}), 404
        
        # Check ETag for concurrency control
        if_match = request.headers.get('If-Match')
        if if_match and if_match.strip('"') != card._etag:
            return jsonify({'_error': 'Card has been modified'}), 412
        
        data = request.get_json()
        
        # Update fields
        if 'member' in data:
            card.member = data['member']
        if 'resources' in data:
            card.resources = data['resources']
        if 'uuid' in data:
            card.uuid = data['uuid']
        
        card._updated = get_current_time()
        card._etag = str(uuid.uuid4())
        
        db.session.commit()
        return jsonify({
            'id': card.id,
            'uuid': card.uuid,
            'uuid_bin': card.uuid_bin,
            'member': card.member,
            'resources': card.resources,
            '_created': card._created.isoformat() if card._created else None,
            '_updated': card._updated.isoformat() if card._updated else None,
            '_etag': card._etag
        })

    @app.route('/api/cards/<int:card_id>', methods=['DELETE'])
    def delete_card(card_id):
        card = db.session.get(Cards, card_id)
        if not card:
            return jsonify({'_error': 'Card not found'}), 404
        
        # Check ETag for concurrency control
        if_match = request.headers.get('If-Match')
        if if_match and if_match.strip('"') != card._etag:
            return jsonify({'_error': 'Card has been modified'}), 412
        
        db.session.delete(card)
        db.session.commit()
        return '', 204

    # Keycodes endpoints
    @app.route('/api/keycodes', methods=['GET', 'POST'])
    def get_keycodes():
        if request.method == 'POST':
            data = request.get_json() or {}
            kc = KeyCodes()
            kc.name = data.get('name')
            kc.code = data.get('code')
            # Parse date/time inputs if provided
            try:
                sd = data.get('start_date')
                kc.start_date = datetime.date.fromisoformat(sd) if sd else None
            except Exception:
                kc.start_date = None
            try:
                ed = data.get('end_date')
                kc.end_date = datetime.date.fromisoformat(ed) if ed else None
            except Exception:
                kc.end_date = None
            try:
                dst = data.get('daily_start_time')
                kc.daily_start_time = datetime.time.fromisoformat(dst) if dst else None
            except Exception:
                kc.daily_start_time = None
            try:
                det = data.get('daily_end_time')
                kc.daily_end_time = datetime.time.fromisoformat(det) if det else None
            except Exception:
                kc.daily_end_time = None
            kc.resource = data.get('resource')
            kc.granted = data.get('granted', True)
            kc.reason = data.get('reason', '')
            kc._created = get_current_time()
            kc._updated = get_current_time()
            kc._etag = str(uuid.uuid4())

            # Simple unique code check
            existing = db.session.query(KeyCodes).filter_by(code=kc.code).first()
            if existing:
                return jsonify({'_error': 'Keycode already exists'}), 409

            db.session.add(kc)
            db.session.commit()
            return jsonify({
                'id': kc.id,
                'name': kc.name,
                'code': kc.code,
                'start_date': kc.start_date.isoformat() if kc.start_date else None,
                'end_date': kc.end_date.isoformat() if kc.end_date else None,
                'daily_start_time': kc.daily_start_time.isoformat() if kc.daily_start_time else None,
                'daily_end_time': kc.daily_end_time.isoformat() if kc.daily_end_time else None,
                'resource': kc.resource,
                'granted': kc.granted,
                'reason': kc.reason,
                '_created': kc._created.isoformat() if kc._created else None,
                '_updated': kc._updated.isoformat() if kc._updated else None,
                '_etag': kc._etag
            }), 201
        else:
            keycodes = (
                db.session.query(KeyCodes)
                .order_by(KeyCodes._created.desc(), KeyCodes.id.desc())
                .all()
            )
            return jsonify({
                '_items': [{
                    'id': kc.id,
                    'name': kc.name,
                    'code': kc.code,
                    'start_date': kc.start_date.isoformat() if kc.start_date else None,
                    'end_date': kc.end_date.isoformat() if kc.end_date else None,
                    'daily_start_time': kc.daily_start_time.isoformat() if kc.daily_start_time else None,
                    'daily_end_time': kc.daily_end_time.isoformat() if kc.daily_end_time else None,
                    'resource': kc.resource,
                    'granted': kc.granted,
                    'reason': kc.reason,
                    '_created': kc._created.isoformat() if kc._created else None,
                    '_updated': kc._updated.isoformat() if kc._updated else None,
                    '_etag': kc._etag
                } for kc in keycodes],
                '_meta': {
                    'max_results': len(keycodes),
                    'total': len(keycodes)
                }
            })

    @app.route('/api/keycodes/<int:keycode_id>', methods=['GET'])
    def get_keycode(keycode_id):
        kc = db.session.get(KeyCodes, keycode_id)
        if not kc:
            return jsonify({'_error': 'Keycode not found'}), 404
        return jsonify({
            'id': kc.id,
            'name': kc.name,
            'code': kc.code,
            'start_date': kc.start_date.isoformat() if kc.start_date else None,
            'end_date': kc.end_date.isoformat() if kc.end_date else None,
            'daily_start_time': kc.daily_start_time.isoformat() if kc.daily_start_time else None,
            'daily_end_time': kc.daily_end_time.isoformat() if kc.daily_end_time else None,
            'resource': kc.resource,
            'granted': kc.granted,
            'reason': kc.reason,
            '_created': kc._created.isoformat() if kc._created else None,
            '_updated': kc._updated.isoformat() if kc._updated else None,
            '_etag': kc._etag
        })

    @app.route('/api/keycodes/<int:keycode_id>', methods=['PATCH'])
    def update_keycode(keycode_id):
        kc = db.session.get(KeyCodes, keycode_id)
        if not kc:
            return jsonify({'_error': 'Keycode not found'}), 404

        # Check ETag for concurrency control
        if_match = request.headers.get('If-Match')
        if if_match and if_match.strip('"') != kc._etag:
            return jsonify({'_error': 'Keycode has been modified'}), 412

        data = request.get_json() or {}

        # Update allowed fields
        if 'name' in data:
            kc.name = data['name']
        if 'code' in data:
            kc.code = data['code']
        if 'start_date' in data:
            try:
                kc.start_date = datetime.date.fromisoformat(data['start_date']) if data['start_date'] else None
            except Exception:
                pass
        if 'end_date' in data:
            try:
                kc.end_date = datetime.date.fromisoformat(data['end_date']) if data['end_date'] else None
            except Exception:
                pass
        if 'daily_start_time' in data:
            try:
                kc.daily_start_time = datetime.time.fromisoformat(data['daily_start_time']) if data['daily_start_time'] else None
            except Exception:
                pass
        if 'daily_end_time' in data:
            try:
                kc.daily_end_time = datetime.time.fromisoformat(data['daily_end_time']) if data['daily_end_time'] else None
            except Exception:
                pass
        if 'resource' in data:
            kc.resource = data['resource']
        if 'granted' in data:
            kc.granted = data['granted']
        if 'reason' in data:
            kc.reason = data['reason']

        kc._updated = get_current_time()
        kc._etag = str(uuid.uuid4())

        db.session.commit()
        return jsonify({
            'id': kc.id,
            'name': kc.name,
            'code': kc.code,
            'start_date': kc.start_date.isoformat() if kc.start_date else None,
            'end_date': kc.end_date.isoformat() if kc.end_date else None,
            'daily_start_time': kc.daily_start_time.isoformat() if kc.daily_start_time else None,
            'daily_end_time': kc.daily_end_time.isoformat() if kc.daily_end_time else None,
            'resource': kc.resource,
            'granted': kc.granted,
            'reason': kc.reason,
            '_etag': kc._etag
        })

    @app.route('/api/keycodes/<int:keycode_id>', methods=['DELETE'])
    def delete_keycode(keycode_id):
        kc = db.session.get(KeyCodes, keycode_id)
        if not kc:
            return jsonify({'_error': 'Keycode not found'}), 404

        # Check ETag for concurrency control
        if_match = request.headers.get('If-Match')
        if if_match and if_match.strip('"') != kc._etag:
            return jsonify({'_error': 'Keycode has been modified'}), 412

        db.session.delete(kc)
        db.session.commit()
        return '', 204

    @app.route('/api/logs', methods=['GET'])
    def get_logs():
        page = 1
        try:
            page = int(request.args.get('page', 1))
        except Exception:
            page = 1
        per_page = 50

        base_query = db.session.query(Logs).order_by(Logs._created.desc(), Logs.id.desc())
        total = base_query.count()
        logs = base_query.offset((page - 1) * per_page).limit(per_page).all()

        return jsonify({
            '_items': [{
                'id': log.id,
                'uuid': log.uuid,
                'uuid_bin': log.uuid_bin,
                'member': log.member,
                'code': getattr(log, 'code', None),
                'name': getattr(log, 'name', None),
                'resource': log.resource,
                'granted': log.granted,
                'reason': log.reason,
                '_created': log._created.isoformat() if log._created else None,
                '_updated': log._updated.isoformat() if log._updated else None,
                '_etag': log._etag
            } for log in logs],
            '_meta': {
                'max_results': per_page,
                'total': total
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
        # Production mode - without SSL for now (since SSL certs are missing)
        port = 443
        app.run(host="0.0.0.0", port=port)
