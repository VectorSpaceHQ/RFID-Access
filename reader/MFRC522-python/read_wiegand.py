#!/usr/bin/env python3
import time
import RPi.GPIO as GPIO
import unlock
from datetime import datetime, timedelta

GPIO.setmode(GPIO.BOARD)

MAX_BITS = 26
READER_TIMEOUT = 25000000 #was 1000000. Alan found code that used 25000000
READER_TIMEOUT = 10000000 # lowered by adam 7/12/22
REAR_DOOR_A_PIN = 11
REAR_DOOR_B_PIN = 12
REAR_DOOR_RELAY_PIN = 8
REAR_DOOR_LED_PIN = 16
REAR_DOOR_SPKR_PIN = 15
FRONT_DOOR_A_PIN = 37
FRONT_DOOR_B_PIN = 38
FRONT_DOOR_LED_PIN = 36
FRONT_DOOR_SPKR_PIN = 35
FRONT_DOOR_RELAY_PIN = 10



REAR_DOOR_A_PIN = 8
REAR_DOOR_B_PIN = 10
REAR_DOOR_RELAY_PIN = 19
REAR_DOOR_LED_PIN = 23
REAR_DOOR_SPKR_PIN = 21

FRONT_DOOR_A_PIN = 11
FRONT_DOOR_B_PIN = 12
FRONT_DOOR_LED_PIN = 31
FRONT_DOOR_SPKR_PIN = 29
FRONT_DOOR_RELAY_PIN = 22

THIRD_DOOR_A_PIN = 13
THIRD_DOOR_B_PIN = 15
THIRD_DOOR_LED_PIN = 24
THIRD_DOOR_SPKR_PIN = 26
THIRD_DOOR_RELAY_PIN = 37

BSMITH_DOOR_A_PIN = 16
BSMITH_DOOR_B_PIN = 18
BSMITH_DOOR_LED_PIN = 40
BSMITH_DOOR_SPKR_PIN = 38
BSMITH_DOOR_RELAY_PIN = 36 # seems to prevent pi from booting???



GPIO.setup(FRONT_DOOR_RELAY_PIN, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(FRONT_DOOR_LED_PIN, GPIO.OUT, initial=GPIO.HIGH)
GPIO.setup(FRONT_DOOR_SPKR_PIN, GPIO.OUT, initial=GPIO.HIGH)
GPIO.setup(REAR_DOOR_RELAY_PIN, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(REAR_DOOR_LED_PIN, GPIO.OUT, initial=GPIO.HIGH)
GPIO.setup(REAR_DOOR_SPKR_PIN, GPIO.OUT, initial=GPIO.HIGH)
GPIO.setup(BSMITH_DOOR_RELAY_PIN, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(BSMITH_DOOR_LED_PIN, GPIO.OUT, initial=GPIO.HIGH)
GPIO.setup(BSMITH_DOOR_SPKR_PIN, GPIO.OUT, initial=GPIO.HIGH)

class decoder():
    def __init__(self, gpio_0, gpio_1):
        self.data = 0
        self.bit_count = 0
        self.bit_time = 0
        
        GPIO.setup(gpio_0, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.setup(gpio_1, GPIO.IN, pull_up_down=GPIO.PUD_UP)

        GPIO.add_event_detect(gpio_0, GPIO.FALLING, callback=lambda x: self.getData0())
        GPIO.add_event_detect(gpio_1, GPIO.FALLING, callback=lambda x: self.getData1())

    def getData0(self):
        if self.bit_count < MAX_BITS:
            self.bit_count += 1
            self.data = self.data << 1
        self.bit_time = time.time_ns()

    def getData1(self):
        if self.bit_count < MAX_BITS:
            self.bit_count += 1
            self.data = self.data << 1
            self.data = self.data | 1
        self.bit_time = time.time_ns()

    def get_pending_bit_count(self):
       delta_sec = time.time() - (self.bit_time / 10**9)
       delta_nsec = time.time_ns() - self.bit_time
       if (delta_sec > 1 or delta_nsec > READER_TIMEOUT):
           return self.bit_count
       return 0

    def read_data(self):
        if self.get_pending_bit_count() > 0:
            bit_count = self.bit_count
            data = self.data
            self.reset()
            return data

    def reset(self):
        self.bit_count = 0
        self.data = 0

        
if __name__ == "__main__":
   print("Starting")
   scantime = datetime.now()
   w = decoder(REAR_DOOR_A_PIN, REAR_DOOR_B_PIN)
   w2 = decoder(FRONT_DOOR_A_PIN, FRONT_DOOR_B_PIN)
   w3 = decoder(BSMITH_DOOR_A_PIN, BSMITH_DOOR_B_PIN)

   while True:
       bitLen = w.get_pending_bit_count()
       if bitLen <= 5: # changed 6/24/23 to help avoid spurious readings.
           time.sleep(0.2)
           pass
       else:
           data = "{:026b}".format(w.read_data())
           print("scan detected at front door: " + str(data))
           if scantime + timedelta(seconds = 3) < datetime.now(): 
               scantime = datetime.now()


               if str(data) == "00000000000000000000000000":
                   print("Ignoring 00000 read")
                   # continue

               # wiegand_one = data[17:25] + data[9:17] # big white
               # wiegand_two = data[9:17] + data[17:25] # small blue

               if unlock.isAllowed("Front Door", data, data):
                   print("Front Door: Open Sesame")
                   GPIO.output(REAR_DOOR_RELAY_PIN, True)
                   GPIO.output(REAR_DOOR_LED_PIN, GPIO.LOW)
                   for i in range(0,8):
                       GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.LOW)
                       time.sleep(.05)
                       GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.HIGH)
                       time.sleep(.3)
                   GPIO.output(REAR_DOOR_LED_PIN, GPIO.HIGH)
                   GPIO.output(REAR_DOOR_RELAY_PIN, False)                       
               else:
                   print("front Door: Access denied")
                   GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.LOW)
                   time.sleep(0.5)
                   GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.HIGH)


       bitLen2 = w2.get_pending_bit_count()
       if bitLen2 <= 4:
           time.sleep(0.2)
           pass
       else:
           data = "{:026b}".format(w2.read_data())
           print("scan detected at rear door: " + str(data))
           if scantime + timedelta(seconds = 5) < datetime.now(): 
               scantime = datetime.now()
           else:
               continue
               
           if unlock.isAllowed("Rear Door", data, data):
               print("Rear Door: Open Sesame")
               GPIO.output(FRONT_DOOR_RELAY_PIN, True)
               GPIO.output(FRONT_DOOR_LED_PIN, GPIO.LOW)

               for i in range(0,8):
                   GPIO.output(FRONT_DOOR_SPKR_PIN, GPIO.LOW)
                   time.sleep(.05)
                   GPIO.output(FRONT_DOOR_SPKR_PIN, GPIO.HIGH)
                   time.sleep(.3)

               GPIO.output(FRONT_DOOR_LED_PIN, GPIO.HIGH)
               GPIO.output(FRONT_DOOR_RELAY_PIN, False)
           else:
               print("Rear Door: Access denied")
               GPIO.output(FRONT_DOOR_SPKR_PIN, GPIO.LOW)
               time.sleep(0.5)
               GPIO.output(FRONT_DOOR_SPKR_PIN, GPIO.HIGH)               



       bitLen3 = w3.get_pending_bit_count()
       if bitLen3 <= 4:
           time.sleep(0.2)
           pass
       else:
           data = "{:026b}".format(w3.read_data())
           print("scan detected at rear door: " + str(data))
           if scantime + timedelta(seconds = 5) < datetime.now(): 
               scantime = datetime.now()
           else:
               continue
               
           if unlock.isAllowed("Rear Door", data, data):
               print("Blacksmithing Door: Open Sesame")
               GPIO.output(BSMITH_DOOR_RELAY_PIN, True)
               GPIO.output(BSMITH_DOOR_LED_PIN, GPIO.LOW)

               for i in range(0,8):
                   GPIO.output(BSMITH_DOOR_SPKR_PIN, GPIO.LOW)
                   time.sleep(.05)
                   GPIO.output(BSMITH_DOOR_SPKR_PIN, GPIO.HIGH)
                   time.sleep(.3)

               GPIO.output(BSMITH_DOOR_LED_PIN, GPIO.HIGH)
               GPIO.output(BSMITH_DOOR_RELAY_PIN, False)
           else:
               print("Blacksmithing Door: Access denied")
               GPIO.output(BSMITH_DOOR_SPKR_PIN, GPIO.LOW)
               time.sleep(0.5)
               GPIO.output(BSMITH_DOOR_SPKR_PIN, GPIO.HIGH)

               

