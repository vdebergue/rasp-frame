#!/usr/bin/python3
# This script is started at reboot by cron
# Since the start is very early in the boot sequence we wait for the i2c-1 device

import pijuice, time, os, datetime

while not os.path.exists('/dev/i2c-1'):
    time.sleep(0.1)

pj = pijuice.PiJuice(1, 0x14)
print(f"Current time: {datetime.date.today()}")
print(f"status {pj.status.GetStatus()}")
print(f"charge level: {pj.status.GetChargeLevel()}")
now = datetime.datetime.now()
dt = {
    'second': now.second,
    'minute': now.minute,
    'hour': now.hour,
    'weekday': now.weekday(),
    'day': now.day,
    'month': now.month,
    'year': now.year,
}
pj.rtcAlarm.SetTime(dt)
pj.rtcAlarm.SetAlarm(
    {
        'second': 0,
        'minute': 30,
        'hour': 17,
        'day': 'EVERY_DAY',
        'month': 'EVERY_MONTH',
        'year': 'EVERY_YEAR'
    }
)
pj.rtcAlarm.SetWakeupEnabled(True)
print(f"alarm: {pj.rtcAlarm.GetAlarm()}")
