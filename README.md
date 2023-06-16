# Vector Space RFID Access System
## Overiew
Vector Space members need 24/7 access to our building. In order to provide this level of access and to keep the building secure, there is a need to restrict access to only those who are authorized. We have chosen to implement an RFID card access system to proide this type of access.

## Hardware
The following hardware components are used in this project:
 * HID card readers
 * Mifare RFID cards
 * Raspberry Pi
 * Electric door catch
 * Relay
 * 12 VDC power supply

### HID Card Reader
HID Readers use the 26 bit Wiegand protocol.
Power and signals both at 12VDC.

6 wires, 4 logic:
PWR
GND
A - INPUT
B - INPUT
LED - OUTPUT
SPKR - OUTPUT

## Software
The following software components are used in this project:
 * Card reader
 * Web client
 * Web server

## Installation
### Hardware
TBD
### Software
1. Use NOOBS to install a fresh copy of Raspbian on the Raspberry Pi
2. Connect to network with the wireless adapter
3. From the home directory, create a `repos` folder and clone this repository into it.

    ```
    pi@raspberrypi:~ $ mkdir repos
    pi@raspberrypi:~/repos $ cd repos
    pi@raspberrypi:~/repos $ git clone https://github.com/VectorSpaceHQ/RFID-Access.git
    ```
4. Install the _python-dev_ package so that the native extensions for the required python modules can be built.

    ```
    pi@raspberrypi:~/repos $ sudo apt-get install python-dev
    ```
5. Install the _virtualenv_ package so that we can install our dependencies in an isolated Python environment.

    ```
    pi@raspberrypi:~/repos $ sudo apt-get install virtualenv
    ```
6. Navigate to the `server` directory inside the repository and create the Python virtual environment.

    ```
    pi@raspberrypi:~/respos $ cd RFID-access/server
    pi@raspberrypi:~/respos/RFID-access/server $ virtualenv .venv
    ```
7. Enter the virtual environment and install the required dependencies.

    ```
    pi@raspberrypi:~/respos/RFID-access/server $ source .venv/bin/activate
    (.venv)pi@raspberrypi:~/respos/RFID-access/server $ pip install -r requirements.txt
    ```
8. The server requires an SSL certificate and key to be placed in the `server/ssl` directory. They must be named `RFID.crt`
and `RFID.key`. You can geneate a self-signed key by running the following command and entering the appropriate details
in the prompts:

    ```
    pi@raspberrypi:~/respos/RFID-access/server $ mkdir ssl
    pi@raspberrypi:~/respos/RFID-access/server $ sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/RFID.key -out ssl/RFID.crt
    ```
9. Start the server by running the following command:

    ```
    (.venv)pi@raspberrypi:~/respos/RFID-access/server $ sudo .venv/bin/python run.py
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    No users found in database
    Creating root user with password HFYnxIWR*b
    You should change the root password NOW!
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
     * Running on https://0.0.0.0:443/ (Press CTRL+C to quit)
    ```
10. The first time you run the server there will not be any users in the database.  A root user will be created and a
random password will be generated. Use a web browser to navigate to the IP address of Raspberry Pi (e.g. https://10.0.0.144 ) and login as the root
uesr with the random password. Select the __Users__ button and then select the __Change Password__ link to change the root user's password.

11. Stop the server by pressing CTRL+C

12. Add the follwing line to the `/etc/rc.local` file so that the server starts at power-up.

    ```
    /home/pi/repos/RFID-Access/server/.venv/bin/python /home/pi/repos/RFID-Access/server/run.py &
    ```
13. TBD - _Add instructions for installing and running card reader_

## Development
TBD
