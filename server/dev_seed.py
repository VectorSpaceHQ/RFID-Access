#!/usr/bin/env python3
"""
Development Seed Data Script for RFID Access System
This script populates the database with test data for development purposes.
"""

import sys
import os
import datetime
import time
import bcrypt
import hashlib
import random
import string
from datetime import datetime, timedelta

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from run import app, db, generate_password
from tables import Users, Resources, Cards, Logs, Tokens, KeyCodes, Base

def create_hash():
    """Create a hash for etag"""
    hash_obj = hashlib.sha1()
    hash_obj.update(datetime.now().isoformat().encode())
    return hash_obj.hexdigest()

def get_current_time():
    """Get current datetime for _created and _updated fields"""
    return datetime.now()

def seed_users():
    """Seed users table with test data"""
    print("Seeding users...")
    
    users_data = [
        {
            'username': 'admin',
            'password': 'admin123',
            'admin': True
        },
        {
            'username': 'john.doe',
            'password': 'password123',
            'admin': False
        },
        {
            'username': 'jane.smith',
            'password': 'password123',
            'admin': False
        },
        {
            'username': 'bob.wilson',
            'password': 'password123',
            'admin': False
        },
        {
            'username': 'alice.johnson',
            'password': 'password123',
            'admin': False
        },
        {
            'username': 'charlie.brown',
            'password': 'password123',
            'admin': False
        },
        {
            'username': 'diana.prince',
            'password': 'password123',
            'admin': True
        },
        {
            'username': 'bruce.wayne',
            'password': 'password123',
            'admin': False
        },
        {
            'username': 'peter.parker',
            'password': 'password123',
            'admin': False
        },
        {
            'username': 'tony.stark',
            'password': 'password123',
            'admin': True
        }
    ]
    
    for user_data in users_data:
        # Check if user already exists
        existing_user = db.session.query(Users).filter(Users.username == user_data['username']).first()
        if not existing_user:
            hashed_password = bcrypt.hashpw(user_data['password'].encode('utf-8'), bcrypt.gensalt())
            user = Users(
                username=user_data['username'],
                password=hashed_password.decode('utf-8'),
                admin=user_data['admin'],
                _created=get_current_time(),
                _updated=get_current_time(),
                _etag=create_hash()
                
            )
            db.session.add(user)
            print(f"  Added user: {user_data['username']}")
        else:
            print(f"  User already exists: {user_data['username']}")
    
    db.session.commit()

def seed_resources():
    """Seed resources table with test data"""
    print("Seeding resources...")
    
    resources_data = [
        {'name': 'Main Entrance'},
        {'name': 'Server Room'},
        {'name': 'Lab A'},
        {'name': 'Conference Room'}
    ]
    
    for resource_data in resources_data:
        existing_resource = db.session.query(Resources).filter(Resources.name == resource_data['name']).first()
        if not existing_resource:
            resource = Resources(
                name=resource_data['name'],
                _created=get_current_time(),
                _updated=get_current_time(),
                _etag=create_hash()
            )
            db.session.add(resource)
            print(f"  Added resource: {resource_data['name']}")
        else:
            print(f"  Resource already exists: {resource_data['name']}")
    
    db.session.commit()

def seed_cards():
    """Seed cards table with test data"""
    print("Seeding cards...")
    
    # Generate realistic RFID UUIDs
    cards_data = [
        {
            'uuid': '550e8400-e29b-41d4-a716-446655440001',
            'uuid_bin': '0101010100001110100001000000000011100010100110110100000111010100011100010110011001100101010101000100000000000001',
            'member': 'John Doe',
            'resources': '1,2'
        },
        {
            'uuid': '550e8400-e29b-41d4-a716-446655440002',
            'uuid_bin': '0101010100001110100001000000000011100010100110110100000111010100011100010110011001100101010101000100000000010',
            'member': 'Jane Smith',
            'resources': '1,3'
        },
        {
            'uuid': '550e8400-e29b-41d4-a716-446655440003',
            'uuid_bin': '0101010100001110100001000000000011100010100110110100000111010100011100010110011001100101010101000100000000011',
            'member': 'Bob Wilson',
            'resources': '1,2,3'
        },
        {
            'uuid': '550e8400-e29b-41d4-a716-446655440004',
            'uuid_bin': '0101010100001110100001000000000011100010100110110100000111010100011100010110011001100101010101000100000000100',
            'member': 'Alice Johnson',
            'resources': '1'
        },
        {
            'uuid': '550e8400-e29b-41d4-a716-446655440005',
            'uuid_bin': '0101010100001110100001000000000011100010100110110100000111010100011100010110011001100101010101000100000000101',
            'member': 'Charlie Brown',
            'resources': '2,4'
        },
        {
            'uuid': '550e8400-e29b-41d4-a716-446655440006',
            'uuid_bin': '0101010100001110100001000000000011100010100110110100000111010100011100010110011001100101010101000100000000110',
            'member': 'Diana Prince',
            'resources': '1,2,3,4'
        },
        {
            'uuid': '550e8400-e29b-41d4-a716-446655440007',
            'uuid_bin': '0101010100001110100001000000000011100010100110110100000111010100011100010110011001100101010101000100000000111',
            'member': 'Bruce Wayne',
            'resources': '1,3'
        },
        {
            'uuid': '550e8400-e29b-41d4-a716-446655440008',
            'uuid_bin': '0101010100001110100001000000000011100010100110110100000111010100011100010110011001100101010101000100000001000',
            'member': 'Peter Parker',
            'resources': '2'
        },
        {
            'uuid': '550e8400-e29b-41d4-a716-446655440009',
            'uuid_bin': '0101010100001110100001000000000011100010100110110100000111010100011100010110011001100101010101000100000001001',
            'member': 'Tony Stark',
            'resources': '1,2,3,4'
        },
        {
            'uuid': '550e8400-e29b-41d4-a716-446655440010',
            'uuid_bin': '0101010100001110100001000000000011100010100110110100000111010100011100010110011001100101010101000100000001010',
            'member': 'Clark Kent',
            'resources': '1,2'
        }
    ]
    
    for card_data in cards_data:
        existing_card = db.session.query(Cards).filter(Cards.uuid == card_data['uuid']).first()
        if not existing_card:
            card = Cards(
                uuid=card_data['uuid'],
                uuid_bin=card_data['uuid_bin'],
                member=card_data['member'],
                resources=card_data['resources'],
                _created=get_current_time(),
                _updated=get_current_time(),
                _etag=create_hash()
            )
            db.session.add(card)
            print(f"  Added card for: {card_data['member']}")
        else:
            print(f"  Card already exists for: {card_data['member']}")
    
    db.session.commit()

def seed_logs():
    """Seed logs table with test data"""
    print("Seeding logs...")
    
    # Get some existing cards and resources for realistic logs
    cards = db.session.query(Cards).limit(5).all()
    resources = db.session.query(Resources).all()
    
    if not cards or not resources:
        print("  Skipping logs - need cards and resources first")
        return
    
    logs_data = [
        {
            'uuid': cards[0].uuid,
            'uuid_bin': cards[0].uuid_bin,
            'member': cards[0].member,
            'resource': resources[0].name,
            'granted': True,
            'reason': 'Valid access'
        },
        {
            'uuid': cards[1].uuid,
            'uuid_bin': cards[1].uuid_bin,
            'member': cards[1].member,
            'resource': resources[1].name,
            'granted': True,
            'reason': 'Valid access'
        },
        {
            'uuid': cards[2].uuid,
            'uuid_bin': cards[2].uuid_bin,
            'member': cards[2].member,
            'resource': resources[2].name,
            'granted': False,
            'reason': 'Access denied - insufficient privileges'
        },
        {
            'uuid': cards[0].uuid,
            'uuid_bin': cards[0].uuid_bin,
            'member': cards[0].member,
            'resource': resources[3].name,
            'granted': True,
            'reason': 'Valid access'
        },
        {
            'uuid': cards[3].uuid,
            'uuid_bin': cards[3].uuid_bin,
            'member': cards[3].member,
            'resource': resources[0].name,
            'granted': True,
            'reason': 'Valid access'
        },
        {
            'uuid': cards[4].uuid,
            'uuid_bin': cards[4].uuid_bin,
            'member': cards[4].member,
            'resource': resources[1].name,
            'granted': False,
            'reason': 'Card expired'
        },
        {
            'uuid': cards[1].uuid,
            'uuid_bin': cards[1].uuid_bin,
            'member': cards[1].member,
            'resource': resources[2].name,
            'granted': True,
            'reason': 'Valid access'
        },
        {
            'uuid': cards[2].uuid,
            'uuid_bin': cards[2].uuid_bin,
            'member': cards[2].member,
            'resource': resources[0].name,
            'granted': True,
            'reason': 'Valid access'
        },
        {
            'uuid': cards[3].uuid,
            'uuid_bin': cards[3].uuid_bin,
            'member': cards[3].member,
            'resource': resources[3].name,
            'granted': False,
            'reason': 'Access denied - outside hours'
        },
        {
            'uuid': cards[4].uuid,
            'uuid_bin': cards[4].uuid_bin,
            'member': cards[4].member,
            'resource': resources[2].name,
            'granted': True,
            'reason': 'Valid access'
        }
    ]

    # Add keypad-based logs (mix of entries)
    keycodes = db.session.query(KeyCodes).all()
    if keycodes:
        for i, kc in enumerate(keycodes[:len(logs_data)]):
            logs_data.insert(i * 2 + 1, {
                'uuid': '',
                'uuid_bin': '',
                'member': '',
                'code': kc.code,
                'name': kc.name,
                'resource': kc.resource,
                'granted': True,
                'reason': 'Keycode access'
            })
    
    for log_data in logs_data:
        log = Logs(
            uuid=log_data['uuid'],
            uuid_bin=log_data['uuid_bin'],
            member=log_data.get('member',''),
            code=log_data.get('code',''),
            name=log_data.get('name',''),
            resource=log_data['resource'],
            granted=log_data['granted'],
            reason=log_data['reason'],
            _created=get_current_time(),
            _updated=get_current_time(),
            _etag=create_hash()
        )
        db.session.add(log)
        who = log_data.get('member') or log_data.get('name') or 'Unknown'
        print(f"  Added log entry for {who} at {log_data['resource']}")
    
    db.session.commit()

def seed_keycodes():
    """Seed keycodes table with test data"""
    print("Seeding keycodes...")
    
    resources = db.session.query(Resources).all()
    if not resources:
        print("  Skipping keycodes - need resources first")
        return
    
    # Generate some time-based access codes
    now = datetime.now()
    keycodes_data = [
        {
            'name': 'Morning Access',
            'code': '123456',
            'start_date': now.date(),
            'end_date': (now + timedelta(days=30)).date(),
            'daily_start_time': datetime.strptime('08:00:00', '%H:%M:%S').time(),
            'daily_end_time': datetime.strptime('18:00:00', '%H:%M:%S').time(),
            'resource': resources[0].name,
            'granted': True,
            'reason': 'Valid time-based access'
        },
        {
            'name': 'Night Shift',
            'code': '654321',
            'start_date': now.date(),
            'end_date': (now + timedelta(days=30)).date(),
            'daily_start_time': datetime.strptime('22:00:00', '%H:%M:%S').time(),
            'daily_end_time': datetime.strptime('06:00:00', '%H:%M:%S').time(),
            'resource': resources[1].name,
            'granted': True,
            'reason': 'Valid time-based access'
        },
        {
            'name': 'Weekend Access',
            'code': '789012',
            'start_date': now.date(),
            'end_date': (now + timedelta(days=60)).date(),
            'daily_start_time': datetime.strptime('09:00:00', '%H:%M:%S').time(),
            'daily_end_time': datetime.strptime('17:00:00', '%H:%M:%S').time(),
            'resource': resources[2].name,
            'granted': True,
            'reason': 'Valid time-based access'
        },
        {
            'name': 'Emergency Access',
            'code': '999999',
            'start_date': now.date(),
            'end_date': (now + timedelta(days=365)).date(),
            'daily_start_time': datetime.strptime('00:00:00', '%H:%M:%S').time(),
            'daily_end_time': datetime.strptime('23:59:59', '%H:%M:%S').time(),
            'resource': resources[3].name,
            'granted': True,
            'reason': 'Emergency access code'
        },
        {
            'name': 'Lab Access',
            'code': '456789',
            'start_date': now.date(),
            'end_date': (now + timedelta(days=90)).date(),
            'daily_start_time': datetime.strptime('07:00:00', '%H:%M:%S').time(),
            'daily_end_time': datetime.strptime('19:00:00', '%H:%M:%S').time(),
            'resource': resources[0].name,
            'granted': True,
            'reason': 'Valid time-based access'
        },
        {
            'name': 'Visitor Access',
            'code': '111111',
            'start_date': now.date(),
            'end_date': (now + timedelta(days=7)).date(),
            'daily_start_time': datetime.strptime('09:00:00', '%H:%M:%S').time(),
            'daily_end_time': datetime.strptime('17:00:00', '%H:%M:%S').time(),
            'resource': resources[1].name,
            'granted': True,
            'reason': 'Temporary visitor access'
        },
        {
            'name': 'Maintenance Access',
            'code': '222222',
            'start_date': now.date(),
            'end_date': (now + timedelta(days=14)).date(),
            'daily_start_time': datetime.strptime('06:00:00', '%H:%M:%S').time(),
            'daily_end_time': datetime.strptime('20:00:00', '%H:%M:%S').time(),
            'resource': resources[2].name,
            'granted': True,
            'reason': 'Maintenance access'
        },
        {
            'name': 'Conference Access',
            'code': '333333',
            'start_date': now.date(),
            'end_date': (now + timedelta(days=30)).date(),
            'daily_start_time': datetime.strptime('08:00:00', '%H:%M:%S').time(),
            'daily_end_time': datetime.strptime('18:00:00', '%H:%M:%S').time(),
            'resource': resources[3].name,
            'granted': True,
            'reason': 'Conference room access'
        },
        {
            'name': 'After Hours',
            'code': '444444',
            'start_date': now.date(),
            'end_date': (now + timedelta(days=30)).date(),
            'daily_start_time': datetime.strptime('18:00:00', '%H:%M:%S').time(),
            'daily_end_time': datetime.strptime('08:00:00', '%H:%M:%S').time(),
            'resource': resources[0].name,
            'granted': True,
            'reason': 'After hours access'
        },
        {
            'name': 'VIP Access',
            'code': '555555',
            'start_date': now.date(),
            'end_date': (now + timedelta(days=365)).date(),
            'daily_start_time': datetime.strptime('00:00:00', '%H:%M:%S').time(),
            'daily_end_time': datetime.strptime('23:59:59', '%H:%M:%S').time(),
            'resource': resources[1].name,
            'granted': True,
            'reason': 'VIP access code'
        }
    ]
    
    for keycode_data in keycodes_data:
        existing_keycode = db.session.query(KeyCodes).filter(KeyCodes.code == keycode_data['code']).first()
        if not existing_keycode:
            keycode = KeyCodes(
                name=keycode_data['name'],
                code=keycode_data['code'],
                start_date=keycode_data['start_date'],
                end_date=keycode_data['end_date'],
                daily_start_time=keycode_data['daily_start_time'],
                daily_end_time=keycode_data['daily_end_time'],
                resource=keycode_data['resource'],
                granted=keycode_data['granted'],
                reason=keycode_data['reason'],
                _created=get_current_time(),
                _updated=get_current_time(),
                _etag=create_hash()
            )
            db.session.add(keycode)
            print(f"  Added keycode: {keycode_data['name']} ({keycode_data['code']})")
        else:
            print(f"  Keycode already exists: {keycode_data['name']}")
    
    db.session.commit()

def main():
    """Main function to run the seeding process"""
    print("Starting database seeding process...")
    print("=" * 50)
    
    with app.app_context():
        try:
            # Seed data in order of dependencies
            seed_users()
            print()
            
            seed_resources()
            print()
            
            seed_cards()
            print()

            # Seed keycodes before logs so we can include keypad log entries
            seed_keycodes()
            print()

            # Now seed logs as a balanced mix of card and keypad entries
            seed_logs()
            print()
            
            print("=" * 50)
            print("Database seeding completed successfully!")
            print("\nSeed Data Summary:")
            print(f"  Users: {db.session.query(Users).count()}")
            print(f"  Resources: {db.session.query(Resources).count()}")
            print(f"  Cards: {db.session.query(Cards).count()}")
            print(f"  Logs: {db.session.query(Logs).count()}")
            print(f"  KeyCodes: {db.session.query(KeyCodes).count()}")
            print(f"  Tokens: {db.session.query(Tokens).count()}")
            
        except Exception as e:
            print(f"Error during seeding: {e}")
            db.session.rollback()
            raise

if __name__ == "__main__":
    main() 