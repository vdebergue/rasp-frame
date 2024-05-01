# rasp-frame

## Setup

- Download OS lite https://www.raspberrypi.org/software/operating-systems/
- Burn it to SD Card
- Power on and connect with `pi` `raspberry`
- `sudo raspi-config`: enable ssh server and wlan
- `ssh-copy-id pi@raspberrypi.local && ssh pi@raspberrypi.local`

```
sudo apt update
sudo apt upgrade
sudo apt install vim git python3-venv libopenjp2-7 libtiff5
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
# systemctl disable keyboard-setup.service
systemctl disable dphys-swapfile.service
systemctl disable apt-daily.service
systemctl disable apt-daily.timer
systemctl disable nfs-client.target
systemctl disable remote-fs.target
# systemctl disable apt-daily-upgrade.timer
systemctl disable nfs-config.service
```

- Install recent nodejs

```
export NODE_VER=20.12.2
if ! node --version | grep -q ${NODE_VER}; then
  (cat /proc/cpuinfo | grep -q "Pi Zero") && if [ ! -d node-v${NODE_VER}-linux-armv6l ]; then
    echo "Installing nodejs ${NODE_VER} for armv6 from unofficial builds..."
    curl -O https://unofficial-builds.nodejs.org/download/release/v${NODE_VER}/node-v${NODE_VER}-linux-armv6l.tar.xz
    tar -xf node-v${NODE_VER}-linux-armv6l.tar.xz
  fi
  echo "Adding node to the PATH"
  PATH=$(pwd)/node-v${NODE_VER}-linux-armv6l/bin:${PATH}
fi
```

- reboot

# Epaper setup

- enable SPI with `raspi-config`

# Test epaper (optional)

- Install BCM drivers

```
cd /opt
wget http://www.airspayce.com/mikem/bcm2835/bcm2835-1.60.tar.gz
tar zxvf bcm2835-1.60.tar.gz
cd bcm2835-1.60/
./configure
make
sudo make check
sudo make install
```

```
cd
git clone https://github.com/waveshare/IT8951-ePaper.git
cd IT8951-ePaper
make
```

Run

```
sudo ./epd -1.55
```

## Imager

```
python3 -m venv env
source env/bin/activate
cd IT8951
pip install -r requirements.txt
sudo apt install python3-dev
python3 setup.py install
cd ../imager
```

## Pijuice

```
sudo apt-get install pijuice-base

pijuice_cli
```

## Downloader

Config `/opt/rasp-frame/tmp/config.json`

```json
{
  "clientId": "",
  "clientSecret": "",
  "workingFolder": "/opt/rasp-frame/tmp/",
  "albumId": ""
}
```

**Oauth flow no longer works with google photos => download album manually to /opt/rasp-frame/tmp/**

```
# Get oauth token
node downloader/dist/main.js oauth -c /opt/rasp-frame/tmp/config.json

# List google photos album (to get id in config.json)
node downloader/dist/main.js list -c /opt/rasp-frame/tmp/config.json

# Download album locally
node downloader/dist/main.js downloadAlbum -c /opt/rasp-frame/tmp/config.json
```

## Enable service

```
sudo systemctl enable rasp-frame.service
```
