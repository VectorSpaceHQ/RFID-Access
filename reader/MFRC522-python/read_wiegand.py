#!/usr/bin/env python3
import time
import RPi.GPIO as GPIO
import unlock
from datetime import datetime, timedelta

GPIO.setmode(GPIO.BOARD)

MAX_BITS = 26
READER_TIMEOUT = 25000000 #was 1000000. Alan found code that used 25000000
READER_TIMEOUT = 10000000 # lowered by adam 7/12/22

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

BSMITH_DOOR_A_PIN = 13
BSMITH_DOOR_B_PIN = 15
BSMITH_DOOR_LED_PIN = 26
BSMITH_DOOR_SPKR_PIN = 24
BSMITH_DOOR_RELAY_PIN = 37

FOURTH_DOOR_A_PIN = 16
FOURTH_DOOR_B_PIN = 18
FOURTH_DOOR_LED_PIN = 40
FOURTH_DOOR_SPKR_PIN = 38
FOURTH_DOOR_RELAY_PIN = 36 # seems to prevent pi from booting sometimes???

LED_PIN = 32
LED_state = 0


GPIO.setup(FRONT_DOOR_RELAY_PIN, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(FRONT_DOOR_LED_PIN, GPIO.OUT, initial=GPIO.HIGH)
GPIO.setup(FRONT_DOOR_SPKR_PIN, GPIO.OUT, initial=GPIO.HIGH)
GPIO.setup(REAR_DOOR_RELAY_PIN, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(REAR_DOOR_LED_PIN, GPIO.OUT, initial=GPIO.HIGH)
GPIO.setup(REAR_DOOR_SPKR_PIN, GPIO.OUT, initial=GPIO.HIGH)
GPIO.setup(BSMITH_DOOR_RELAY_PIN, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(BSMITH_DOOR_LED_PIN, GPIO.OUT, initial=GPIO.HIGH)
GPIO.setup(BSMITH_DOOR_SPKR_PIN, GPIO.OUT, initial=GPIO.HIGH)
GPIO.setup(LED_PIN, GPIO.OUT, initial=GPIO.LOW)


class LED():
    def __init__(self, pin=LED_PIN):
        self.state = 0
        self.pin = pin
        self.last_change_time = datetime.now()

        GPIO.setup(pin, GPIO.OUT)
        
    def blink(self):
        """
        Toggle from current state to other
        """
        now = datetime.now()
        t_since_blink = now - self.last_change_time
        
        if t_since_blink.total_seconds() > 1:
            self.last_change_time = now
            if self.state == 0:
                GPIO.output(self.pin, GPIO.HIGH)
                self.state = 1
            else:
                GPIO.output(self.pin, GPIO.LOW)
                self.state = 0
            
        

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
        # if self.get_pending_bit_count() > 0:
        bit_count = self.bit_count
        data = self.data
        self.reset()
        return data

    def reset(self):
        self.bit_count = 0
        self.data = 0

    
if __name__ == "__main__":
   print("Starting")
   last_scantime = datetime.now()
   status_LED = LED(LED_PIN)
   w = decoder(REAR_DOOR_A_PIN, REAR_DOOR_B_PIN)
   w2 = decoder(FRONT_DOOR_A_PIN, FRONT_DOOR_B_PIN)
   w3 = decoder(BSMITH_DOOR_A_PIN, BSMITH_DOOR_B_PIN)
   print("READY")

   while True:
       status_LED.blink()
       
       bitLen = w.get_pending_bit_count()
       if bitLen <= 24: # changed 6/24/23 to help avoid spurious readings.
           w.reset() # fixed the triple scan problem
           time.sleep(0.1)
           pass
       else:
           data = "{:026b}".format(w.read_data())
           print("\nscan detected at loading dock: " + str(data))

           if last_scantime + timedelta(seconds = 3) < datetime.now(): 
               last_scantime = datetime.now()
           else:
               continue

           if unlock.isAllowed("Loading Dock", data, data):
               print("Loading Dock: Open Sesame")
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
               print("Loading Dock: Access denied")
               GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.LOW)
               time.sleep(0.5)
               GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.HIGH)


       bitLen2 = w2.get_pending_bit_count()
       if bitLen2 <= 24:
           w2.reset()
           time.sleep(0.1)
           pass
       else:
           data = "{:026b}".format(w2.read_data())
           print("\nscan detected at front door: " + str(data))
           if last_scantime + timedelta(seconds = 3) < datetime.now(): 
               last_scantime = datetime.now()
           else:
               continue
               
           if unlock.isAllowed("Front Door", data, data):
               print("Front Door: Open Sesame")
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
               print("Front Door: Access denied")
               GPIO.output(FRONT_DOOR_SPKR_PIN, GPIO.LOW)
               time.sleep(0.5)
               GPIO.output(FRONT_DOOR_SPKR_PIN, GPIO.HIGH)               


       bitLen3 = w3.get_pending_bit_count()
       if bitLen3 <= 24:
           w3.reset()
           time.sleep(0.1)
           pass
       else:
           data = "{:026b}".format(w3.read_data())
           print("\nscan detected at blacksmithing: " + str(data))
           if last_scantime + timedelta(seconds = 3) < datetime.now(): 
               last_scantime = datetime.now()
           else:
               continue # end this iteration of the loop
               
           # if unlock.isAllowed("Rear Door", data, data):
           if unlock.isAllowed("Blacksmithing", data, data):               
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

               

