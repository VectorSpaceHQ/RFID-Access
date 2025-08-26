#!/bin/bash
# must be run as root

echo "Starting door server"
python /home/vectorspace/RFID-Access/server/run.py &
python /home/vectorspace/RFID-Access/reader/MFRC522-python/read_wiegand.py
echo "Finished"
