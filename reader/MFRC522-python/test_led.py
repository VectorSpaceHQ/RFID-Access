#!/usr/bin/env python3
import RPi.GPIO as GPIO
import time

pin = 40

GPIO.setmode(GPIO.BOARD)

GPIO.setup(pin, GPIO.OUT, initial=GPIO.HIGH)

for x in range(10):
    GPIO.output(pin, GPIO.HIGH)
    time.sleep(.5)
    GPIO.output(pin, GPIO.LOW)
    time.sleep(.5)
