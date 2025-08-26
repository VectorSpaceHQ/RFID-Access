#!/bin/bash
d=`date +%m%d%Y`
dest="/home/pi/RFID-Access/server/backups/rfid_${d}.db"
cp /home/pi/RFID-Access/server/instance/rfid.db $dest
