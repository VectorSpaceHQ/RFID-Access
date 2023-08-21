#!/usr/bin/env python3
import time
import RPi.GPIO as GPIO
from datetime import datetime

GPIO.setmode(GPIO.BOARD)


FRONT_DOOR_RELAY_PIN = 36
REAR_DOOR_RELAY_PIN = 22
#FRONT_DOOR_RELAY_PIN = 27
REAR_DOOR_RELAY_PIN = 19

GPIO.setup(FRONT_DOOR_RELAY_PIN, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(REAR_DOOR_RELAY_PIN, GPIO.OUT, initial=GPIO.LOW)

print("RELAY OPEN")
time.sleep(10)
GPIO.output(FRONT_DOOR_RELAY_PIN,GPIO.HIGH)
GPIO.output(REAR_DOOR_RELAY_PIN,GPIO.HIGH)
print("RELAY CLOSED")
time.sleep(10)
