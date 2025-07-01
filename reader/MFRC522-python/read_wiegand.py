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
#READER_TIMEOUT = 10000000 # lowered by adam 7/12/22

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
    def __init__(self, gpio_0, gpio_1, location=""):
        self.data = 0
        self.bit_count = 0
        self.bit_time = 0
        self.location = location
        self.relay_pin = 1
        self.led_pin = 1
        self.spkr_pin = 1
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
        bitLen = self.get_pending_bit_count()
        if bitLen > 0 and bitLen <= 24: # changed 6/24/23 to help avoid spurious readings.
            logging.debug("\n{}: BAD scan detected at {}: {}".format(datetime.now(), self.location, bitLen))
            print("load dock bad scan: {}".format(bitLen))
            self.reset() # fixed the triple scan problem
            time.sleep(0.1)
           
        elif bitLen > 24:
            data = "{:026b}".format(self.read_data())
            print("\nscan detected at loading dock: " + str(data))
            logging.debug("\n{}: scan detected at {}: {}".format(datetime.now(), self.location, bitLen))

           # if last_scantime + timedelta(seconds = 3) < datetime.now(): 
           #     last_scantime = datetime.now()
           # else:
           # continue

            if unlock.isAllowed(session, self.location, data, data):
                logging.debug("{}: Open Sesame".format(self.location))
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
                logging.debug("Loading Dock: Access denied")
                GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.LOW)
                time.sleep(0.5)
                GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.HIGH)

class KeypadDecoder():
    def __init__(self, gpio_0, gpio_1, led_pin, spkr_pin, relay_pin, location="default"):
        self.data = 0
        self.bit_count = 0
        self.bit_time = 0
        self.location = location
        self.relay_pin = relay_pin
        self.led_pin = led_pin
        self.spkr_pin = spkr_pin
        self.MAX_BITS = 8 * 5 # 8 bits per keypress
        self.last_scantime = datetime.now()
        self.READER_TIMEOUT = 2 # seconds
        
        GPIO.setup(gpio_0, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.setup(gpio_1, GPIO.IN, pull_up_down=GPIO.PUD_UP)

        GPIO.setup(self.relay_pin, GPIO.OUT, initial=GPIO.LOW)
        GPIO.setup(self.led_pin, GPIO.OUT, initial=GPIO.HIGH)
        GPIO.setup(self.spkr_pin, GPIO.OUT, initial=GPIO.HIGH)

        GPIO.add_event_detect(gpio_0, GPIO.FALLING, callback=lambda x: self.getData0())
        GPIO.add_event_detect(gpio_1, GPIO.FALLING, callback=lambda x: self.getData1())

    def getData0(self):
        self.bit_time = time.time_ns()
        if self.bit_count < self.MAX_BITS:
            self.bit_count += 1
            self.data = self.data << 1
        else:
            # print("getdata0 bitcount: "+str(self.bit_count))
            self.process_scan()

    def getData1(self):
        self.bit_time = time.time_ns()
        if self.bit_count < self.MAX_BITS:
            self.bit_count += 1
            self.data = self.data << 1
            self.data = self.data | 1
        else:
            # print("getdata1 bitcount: "+str(self.bit_count))
            self.process_scan()

    def get_pending_bit_count(self):
        """
        if time since last bit reading greater than READER_TIMEOUT or 1 second,
        then accept the bit_count.
        """
        delta_sec = time.time() - (self.bit_time / 10**9)
        delta_nsec = time.time_ns() - self.bit_time
        if (delta_sec > self.READER_TIMEOUT):
            # print("bit count:", self.bit_count)
            # print(delta_sec, delta_nsec)
            self.reset()
        return self.bit_count

    def read_data(self):
        # if self.get_pending_bit_count() > 0:
        bit_count = self.bit_count
        data = self.data
        self.reset()
        return data

    def decode_data(self, data):
        # keypad: each keypress is 8bit?
        keypad_dict = {"11100001":"1",
                       "11010010":"2",
                       "11000011":"3",
                       "10110100":"4",
                       "10100101":"5",
                       "10010110":"6",
                       "10000111":"7",
                       "01111000":"8",
                       "01101001":"9",
                       "11110000":"0",
                       "01011010":"*",
                       "01001011":"#"}
        try:
            data = str(data)
            keycode = ""
            for i in range(0, len(data), 8):
                key = data[i:i+8]
                keycode+=keypad_dict[key]
            return keycode
        except:
            return 0

    def reset(self):
        self.bit_count = 0
        self.data = 0

    def process_scan(self):
        bitLen = self.get_pending_bit_count()
        if bitLen > 0 and bitLen <= self.MAX_BITS - 1:
            logging.debug("\n" + str(datetime.now()) + ": BAD scan detected at lobby: " + str(bitLen))
            print("{} bad scan: {}".format(self.location, bitLen))
            time.sleep(0.1)
           
        elif bitLen >= self.MAX_BITS:
            bitstr = "{:0"+str(self.MAX_BITS)+"b}"
            data = bitstr.format(self.read_data())
            print("\nscan detected at {}: {}".format(self.location, str(data)))
            logging.debug("\n{}: scan detected at {}: {}".format(datetime.now(), self.location, bitLen))
            print(self.decode_data(data))            

       # if bitLen4 > 0 and bitLen4 <= 31: # changed 3/8/24 to help avoid spurious readings.
       #     print("HERE", bitLen4)
       #     # data = "{:026b}".format(w2.read_data())
       #     logging.debug("\n" + str(datetime.now()) + ": BAD scan detected at lobby: " + str(bitLen3))
       #     time.sleep(0.1)
       # elif bitLen4 > 31:
       #     data = "{:032b}".format(w4.read_data())
       #     logging.debug("\n" + str(datetime.now()) + ": scan detected at lobby: " + str(data))
            

           # if last_scantime + timedelta(seconds = 3) < datetime.now(): 
           #     last_scantime = datetime.now()
           # else:
           # continue

            # if unlock.isAllowed(session, self.location, data, data):
            #     logging.debug("{}: Open Sesame".format(self.location))
            #     GPIO.output(REAR_DOOR_RELAY_PIN, True)
            #     GPIO.output(REAR_DOOR_LED_PIN, GPIO.LOW)
            #     for i in range(0,8):
            #         GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.LOW)
            #         time.sleep(.05)
            #         GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.HIGH)
            #         time.sleep(.3)
            #     GPIO.output(REAR_DOOR_LED_PIN, GPIO.HIGH)
            #     GPIO.output(REAR_DOOR_RELAY_PIN, False)                       
            # else:
            #     logging.debug("{}: Access denied".format(self.location))
            #     GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.LOW)
            #     time.sleep(0.5)
            #     GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.HIGH)

                
if __name__ == "__main__":
   logging.debug("Starting")
   last_scantime = datetime.now()
   status_LED = LED(LED_PIN)
   w = decoder(REAR_DOOR_A_PIN, REAR_DOOR_B_PIN)
   w2 = decoder(FRONT_DOOR_A_PIN, FRONT_DOOR_B_PIN)
   w3 = decoder(BSMITH_DOOR_A_PIN, BSMITH_DOOR_B_PIN)
   w4 = KeypadDecoder(FOURTH_DOOR_A_PIN, FOURTH_DOOR_B_PIN, FOURTH_DOOR_LED_PIN,
                      FOURTH_DOOR_SPKR_PIN, FOURTH_DOOR_RELAY_PIN, "Lobby")   
   logging.debug("READY")

   while True:
       time.sleep(0.3) # without this, readings get reset to 0 too quickly I think.
       
       # w.reset() # does this help??
       status_LED.blink()


       bitLen = w.get_pending_bit_count()
       if bitLen > 0 and bitLen <= 24: # changed 6/24/23 to help avoid spurious readings.
           logging.debug("\n" + str(datetime.now()) + ": BAD scan detected at loading dock: " + str(bitLen))
           print("load dock bad scan: {}".format(bitLen))
           w.reset() # fixed the triple scan problem
           time.sleep(0.1)

       elif bitLen > 24:
           data = "{:026b}".format(w.read_data())
           # print("\nscan detected at loading dock: " + str(data))
           logging.debug("\n" + str(datetime.now()) + ": scan detected at loading dock: " + str(data))


           if last_scantime + timedelta(seconds = 3) < datetime.now(): 
               last_scantime = datetime.now()
           else:
               continue

           if unlock.isAllowed(session, "Loading Dock", data, data):
               logging.debug("Loading Dock: Open Sesame")
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
               logging.debug("Loading Dock: Access denied")
               GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.LOW)
               time.sleep(0.5)
               GPIO.output(REAR_DOOR_SPKR_PIN, GPIO.HIGH)


       bitLen2 = w2.get_pending_bit_count()
       if bitLen2 > 0 and bitLen2 <= 24:
           data = "{:026b}".format(w2.read_data())
           print("front door bad scan: {}, {}".format(bitLen2, data))
           logging.debug("\n" + str(datetime.now()) + ": BAD scan detected at front door: " + str(bitLen2))
           w2.reset()
           time.sleep(0.1)
       elif bitLen2 > 24:
           print(bitLen2)
           data = "{:026b}".format(w2.read_data())
           logging.debug("\n" + str(datetime.now()) + ": scan detected at front door: " + str(data))
           if last_scantime + timedelta(seconds = 3) < datetime.now(): 
               last_scantime = datetime.now()
           else:
               continue

           if unlock.isAllowed(session, "Front Door", data, data):
               logging.debug("Front Door: Open Sesame")
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
               logging.debug("Front Door: Access denied")
               GPIO.output(FRONT_DOOR_SPKR_PIN, GPIO.LOW)
               time.sleep(0.5)
               GPIO.output(FRONT_DOOR_SPKR_PIN, GPIO.HIGH)               

               
       bitLen3 = w3.get_pending_bit_count()
       if bitLen3 > 0 and bitLen3 <= 24: # changed 3/8/24 to help avoid spurious readings.
           # data = "{:026b}".format(w2.read_data())
           logging.debug("\n" + str(datetime.now()) + ": BAD scan detected at blacksmithing: " + str(bitLen3))
           # w2.reset()
           time.sleep(0.1)
       elif bitLen3 > 24:
           data = "{:026b}".format(w3.read_data())
           logging.debug("\n" + str(datetime.now()) + ": scan detected at blacksmithing: " + str(data))
           if last_scantime + timedelta(seconds = 3) < datetime.now(): 
               last_scantime = datetime.now()
           else:
               continue # end this iteration of the loop

           if unlock.isAllowed(session, "Blacksmithing", data, data):               
               logging.debug("Blacksmithing Door: Open Sesame")
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
               logging.debug("Blacksmithing Door: Access denied")
               GPIO.output(BSMITH_DOOR_SPKR_PIN, GPIO.LOW)
               time.sleep(0.5)
               GPIO.output(BSMITH_DOOR_SPKR_PIN, GPIO.HIGH)



       # KEYPAD READER = w4        
       bitLen4 = w4.process_scan()
       # if bitLen4 > 0 and bitLen4 <= 31: # changed 3/8/24 to help avoid spurious readings.
       #     print("HERE", bitLen4)
       #     # data = "{:026b}".format(w2.read_data())
       #     logging.debug("\n" + str(datetime.now()) + ": BAD scan detected at lobby: " + str(bitLen3))
       #     time.sleep(0.1)
       # elif bitLen4 > 31:
       #     data = "{:032b}".format(w4.read_data())
       #     logging.debug("\n" + str(datetime.now()) + ": scan detected at lobby: " + str(data))
       #     if last_scantime + timedelta(seconds = 3) < datetime.now(): 
       #         last_scantime = datetime.now()
       #     else:
       #         continue # end this iteration of the loop

       #     print(w4.decode_data(data))

       #     if unlock.isAllowed(session, "Lobby", data, data):               
       #         logging.debug("Lobby Door: Open Sesame")
       #         GPIO.output(BSMITH_DOOR_RELAY_PIN, True)
       #         GPIO.output(BSMITH_DOOR_LED_PIN, GPIO.LOW)

       #         for i in range(0,8):
       #             GPIO.output(BSMITH_DOOR_SPKR_PIN, GPIO.LOW)
       #             time.sleep(.05)
       #             GPIO.output(BSMITH_DOOR_SPKR_PIN, GPIO.HIGH)
       #             time.sleep(.3)

       #         GPIO.output(BSMITH_DOOR_LED_PIN, GPIO.HIGH)
       #         GPIO.output(BSMITH_DOOR_RELAY_PIN, False)
       #     else:
       #         logging.debug("Lobby Door: Access denied")
       #         GPIO.output(BSMITH_DOOR_SPKR_PIN, GPIO.LOW)
       #         time.sleep(0.5)
       #         GPIO.output(BSMITH_DOOR_SPKR_PIN, GPIO.HIGH)               

               

       
