#!/usr/bin/python3

import pijuice, time, os

while not os.path.exists('/dev/i2c-1'):
    time.sleep(0.1)

pj = pijuice.PiJuice(1, 0x14)

# Remove power to PiJuice MCU IO pins
pj.power.SetSystemPowerSwitch(0)

# Remove 5V power to RPi after 60 seconds
pj.power.SetPowerOff(60)
