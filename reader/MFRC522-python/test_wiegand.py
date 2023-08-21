#!/usr/bin/env python3
import time
import RPi.GPIO as GPIO
import unlock
from datetime import datetime

GPIO.setmode(GPIO.BOARD)

MAX_BITS = 26
READER_TIMEOUT = 25000000 #was 1000000. Alan found code that used 25000000
READER_TIMEOUT = 10000000 #was 1000000. Alan found code that used 25000000

FRONT_DOOR_A_PIN = 11
FRONT_DOOR_B_PIN = 12
FRONT_DOOR_LED_PIN = 29
FRONT_DOOR_SPKR_PIN = 31
FRONT_DOOR_RELAY_PIN = 22

GPIO.setup(FRONT_DOOR_RELAY_PIN, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(FRONT_DOOR_LED_PIN, GPIO.OUT, initial=GPIO.HIGH)
GPIO.setup(FRONT_DOOR_SPKR_PIN, GPIO.OUT, initial=GPIO.HIGH)


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
   ntrials = 10
   print("Scan card "+str(ntrials)+" times")
   scan_count = 0
   match_count = 0
   w2 = decoder(FRONT_DOOR_A_PIN, FRONT_DOOR_B_PIN)
   scans = []

   while scan_count < ntrials:
       bitLen = w2.get_pending_bit_count()
       if bitLen == 0: # bad reading
           time.sleep(.1)
       else:

           scan_count += 1
           data = "{:026b}".format(w2.read_data())
           scans.append(data)
           print(data)

           # wiegand_one = data[17:25] + data[9:17] # big white
           # wiegand_two = data[9:17] + data[17:25] # small blue
           
   total_scans = len(scans)
   unique_scans = len(set(scans))
   accuracy = 100 *(ntrials + 1 - unique_scans) / total_scans
   print("accuracy= {}%, {} of {} matched".format(accuracy, ntrials+1-unique_scans, total_scans))
   print(set(scans))
