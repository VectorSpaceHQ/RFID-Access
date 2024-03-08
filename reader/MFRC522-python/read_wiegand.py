#!/usr/bin/env python3
import time
import RPi.GPIO as GPIO
import unlock
from datetime import datetime, timedelta
import logging
import requests
logging.basicConfig(filename='/var/log/door_access.log', level=logging.DEBUG)


GPIO.setmode(GPIO.BOARD)

session = requests.Session()
session.verify = False

MAX_BITS = 26
# These are in nanoseconds. Neither comes close to setting the limit. The Pi is too slow.
READER_TIMEOUT = 25000000 #was 1000000. Alan found code that used 25000000
#READER_TIMEOUT = 10000000 # lowered by adam 7/12/22 (0.01 sec)
#READER_TIMEOUT = 250000000

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
    def __init__(self, gpio_0, gpio_1, relay_pin, led_pin, spkr_pin, location=""):
        self.data = 0
        self.bit_count = 0
        self.bit_time = 0
        self.location = location
        self.relay_pin = relay_pin
        self.led_pin = led_pin
        self.spkr_pin = spkr_pin
        self.last_scantime = datetime.now()
        
        GPIO.setup(gpio_0, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.setup(gpio_1, GPIO.IN, pull_up_down=GPIO.PUD_UP)

        GPIO.add_event_detect(gpio_0, GPIO.FALLING, callback=lambda x: self.getData0())
        GPIO.add_event_detect(gpio_1, GPIO.FALLING, callback=lambda x: self.getData1())

    def getData0(self):
        self.bit_time = time.time_ns()
        if self.bit_count < MAX_BITS:
            self.bit_count += 1
            self.data = self.data << 1
        else:
            self.process_scan()

    def getData1(self):
        self.bit_time = time.time_ns()
        if self.bit_count < MAX_BITS:
            self.bit_count += 1
            self.data = self.data << 1
            self.data = self.data | 1
        else:
            self.process_scan()

    def get_pending_bit_count(self):
        """
        if time since last bit reading greater than READER_TIMEOUT or 1 second,
        then accept the bit_count.
        """
        delta_sec = time.time() - (self.bit_time / 10**9)
        delta_nsec = time.time_ns() - self.bit_time
        if (delta_sec > 1 or delta_nsec > READER_TIMEOUT):
            # print("bit count:", self.bit_count)
            # print(delta_sec, delta_nsec)
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

    def process_scan(self):
        # self.reset()

        bitLen = self.get_pending_bit_count()

        # data = self.read_data()
        # bitLen = len(str(data))
        print("processing scan, {}".format(bitLen))
        
        if bitLen > 0 and bitLen <= 24: # changed 6/24/23 to help avoid spurious readings.
            data = "{:026b}".format(self.read_data())
            logging.debug("\n{}: BAD scan detected at {}: \n{}, {}".format(datetime.now(),
                                                                           self.location, bitLen, data))
            print("{}: bad scan: {}, {}".format(self.location, bitLen, data))
            # self.reset() # fixed the triple scan problem
            # time.sleep(0.1)
           
        elif bitLen > 24:
            data = "{:026b}".format(self.read_data())
            print("\n{}: scan detected at {}: {}".format(datetime.now(),
                                                                 self.location, bitLen))
            logging.debug("\n{}: scan detected at {}: {}".format(datetime.now(),
                                                                 self.location, bitLen))

            if self.last_scantime + timedelta(seconds = 1) < datetime.now(): 
                self.last_scantime = datetime.now()
            else:
                return

            if unlock.isAllowed(session, self.location, data, data):
                logging.debug("{}: Open Sesame".format(self.location))
                GPIO.output(self.relay_pin, True)
                GPIO.output(self.led_pin, GPIO.LOW)
                for i in range(0,8):
                    GPIO.output(self.spkr_pin, GPIO.LOW)
                    time.sleep(.05)
                    GPIO.output(self.spkr_pin, GPIO.HIGH)
                    time.sleep(.3)
                GPIO.output(self.led_pin, GPIO.HIGH)
                GPIO.output(self.relay_pin, False)                       
            else:
                logging.debug("{}: Access denied".format(self.location))
                GPIO.output(self.spkr_pin, GPIO.LOW)
                time.sleep(0.5)
                GPIO.output(self.spkr_pin, GPIO.HIGH)



                
if __name__ == "__main__":
   logging.debug("Starting")

   status_LED = LED(LED_PIN)
   w = decoder(REAR_DOOR_A_PIN, REAR_DOOR_B_PIN, REAR_DOOR_RELAY_PIN,
               REAR_DOOR_LED_PIN, REAR_DOOR_SPKR_PIN, "Loading Dock")
   w2 = decoder(FRONT_DOOR_A_PIN, FRONT_DOOR_B_PIN, FRONT_DOOR_RELAY_PIN,
                FRONT_DOOR_LED_PIN, FRONT_DOOR_SPKR_PIN, "Front Door")
   # w3 = decoder(BSMITH_DOOR_A_PIN, BSMITH_DOOR_B_PIN, BSMITH_DOOR_RELAY_PIN,
   #              BSMITH_DOOR_LED_PIN, BSMITH_DOOR_SPKR_PIN, "Blacksmithin")
   logging.debug("READY")

   while True:
       # w.reset() # does this help??
       status_LED.blink()
       
       # w.process_scan()
       # w2.process_scan()

       # time.sleep(0.1)

       
