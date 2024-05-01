#!/bin/bash

set -exu
set -o pipefail

export ssh_user=${PI_USER:-pi}
export ssh_host=${PI_HOST:-raspberrypi.local}
export ssh_port=${PI_PORT:-22}
export FAST=${FAST:-no}

function rpi_exec() {
  ssh "$ssh_user"@"$ssh_host" -p "$ssh_port" $@
}

root_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
# Compile TS
if [[ "$FAST" == "no" ]]; then
  cd $root_dir/downloader
  npm install
  npm run dist
fi

cd $root_dir

if [[ "$FAST" == "no" ]]; then
  rpi_exec << EOF
  sudo mkdir -p /opt/rasp-frame/tmp
  sudo mkdir -p /opt/rasp-frame/downloader
  sudo mkdir -p /opt/rasp-frame/imager
  sudo mkdir -p /opt/rasp-frame/IT8951
  sudo mkdir -p /opt/rasp-frame/pijuice
  sudo chown -R $ssh_user:$ssh_user /opt/rasp-frame
EOF
fi

rsync -azP -e "ssh -p $ssh_port" $root_dir/downloader/dist "$ssh_user"@"$ssh_host":/opt/rasp-frame/downloader/
rsync -azP -e "ssh -p $ssh_port" $root_dir/imager "$ssh_user"@"$ssh_host":/opt/rasp-frame
rsync -azP -e "ssh -p $ssh_port" $root_dir/IT8951 "$ssh_user"@"$ssh_host":/opt/rasp-frame
rsync -azP -e "ssh -p $ssh_port" $root_dir/run.sh "$ssh_user"@"$ssh_host":/opt/rasp-frame
rsync -azP -e "ssh -p $ssh_port" $root_dir/rasp-frame.unit "$ssh_user"@"$ssh_host":/opt/rasp-frame
rsync -azP -e "ssh -p $ssh_port" $root_dir/pijuice-shutdown.unit "$ssh_user"@"$ssh_host":/opt/rasp-frame
rsync -azP -e "ssh -p $ssh_port" $root_dir/pijuice "$ssh_user"@"$ssh_host":/opt/rasp-frame

rpi_exec << EOF
  sudo cp /opt/rasp-frame/rasp-frame.unit /etc/systemd/system/rasp-frame.service
  sudo cp /opt/rasp-frame/pijuice-shutdown.unit /etc/systemd/system/pijuice-shutdown.service
  sudo systemctl daemon-reload
EOF
