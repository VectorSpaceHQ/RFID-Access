#!/bin/bash
# must be run as root

echo "Starting door server"
cd /home/vectorspace/RFID-Access/server
python run.py &
python /home/vectorspace/RFID-Access/reader/MFRC522-python/read_wiegand.py
echo "Finished"
