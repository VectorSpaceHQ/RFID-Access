#!/bin/bash
d=`date +%m%d%Y`
dest="/home/vectorspace/RFID-Access/server/backups/rfid_${d}.db"
cp /home/vectorspace/RFID-Access/server/instance/rfid.db $dest
