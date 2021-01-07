# rasp-frame

## Setup

- Download OS lite https://www.raspberrypi.org/software/operating-systems/ 
- Burn it to SD Card
- Power on and connect with `pi` `raspberry`
- `sudo raspi-config`: enable ssh server and wlan
- `ssh-copy-id pi@raspberrypi.local && ssh pi@raspberrypi.local`
- ```
sudo apt update
sudo apt upgrade
sudo apt install vim
```
- edit `/boot/config.txt`
```
# Disable the rainbow splash screen
disable_splash=1

# Disable bluetooth
dtoverlay=pi3-disable-bt
 
# Overclock the SD Card from 50 to 100MHz
# This can only be done with at least a UHS Class 1 card
dtoverlay=sdtweak,overclock_50=100
 
# Set the bootloader delay to 0 seconds. The default is 1s if not specified.
boot_delay=0

```
- edit `/boot/cmdline.txt`: add quiet params
```
console=serial0,115200 console=tty1 root=PARTUUID=bc249be9-02 rootfstype=ext4 elevator=deadline fsck.repair=yes quiet rootwait
```
- in `/etc/rc.local` add `/usr/bin/tvservice -o`
- disable services:
```
systemctl disable hciuart
systemctl disable keyboard-setup.service
systemctl disable dphys-swapfile.service
systemctl disable apt-daily.service
systemctl disable apt-daily.timer
systemctl disable nfs-client.target
systemctl disable remote-fs.target
systemctl disable apt-daily-upgrade.timer
systemctl disable nfs-config.service
```
- reboot
