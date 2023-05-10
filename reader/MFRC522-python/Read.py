#!/usr/bin/env python
# -*- coding: utf-8 -*-

import RPi.GPIO as GPIO
import MFRC522
import signal
import urllib2
import urllib
import time
import unlock

continue_reading = True

# Capture SIGINT for cleanup when the script is aborted
def end_read(signal,frame):
    global continue_reading
    print "Ctrl+C captured, ending read."
    continue_reading = False
    GPIO.cleanup()

# Hook the SIGINT
signal.signal(signal.SIGINT, end_read)

# Create an object of the class MFRC522
MIFAREReader = MFRC522.MFRC522()

# MFRC522 READER
GPIO.setup(7,GPIO.OUT)
GPIO.setup(12, GPIO.OUT)


# Welcome message
print "Welcome to the MFRC522 data read example"
print "Press Ctrl-C to stop."

# This loop keeps checking for chips. If one is near it will get the UID and authenticate
while continue_reading:
    
    # Scan for cards    
    (status,TagType) = MIFAREReader.MFRC522_Request(MIFAREReader.PICC_REQIDL)

    # If a card is found
    if status == MIFAREReader.MI_OK:
        print "Card detected"
    
    # Get the UID of the card
    (status,uid) = MIFAREReader.MFRC522_Anticoll()

    # If we have the UID, continue
    if status == MIFAREReader.MI_OK:

        # Print UID
        print "Card read UID: "+str(uid[0])+","+str(uid[1])+","+str(uid[2])+","+str(uid[3])
        uidStr = str(uid[0])+str(uid[1])+str(uid[2])+str(uid[3])
        uid_bin = ''
        for block in uid:
            uid_bin += "{:08b}".format(block)
            print("{:08b}".format(block))
        print("card binary uid:", uid_bin)

        print(type(uidStr), type(uid_bin))
    
	if unlock.isAllowed("Front Door", uidStr, uid_bin):
		print "Open Sesame"
		GPIO.output(7,True)
		GPIO.output(12,True)
		time.sleep(3)
		GPIO.output(7,False)
		print "LED off"
		GPIO.output(12,False)	
	else:
		print "Sorry About Your Luck"



