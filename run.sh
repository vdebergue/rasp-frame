#!/bin/bash

set -exu
set -o pipefail

root_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# export PATH="/home/pi/node-v14.15.4-linux-armv6l/bin:$PATH"
source $root_dir/env/bin/activate
node $root_dir/downloader/dist/main.js randomPhoto --config $root_dir/tmp/config.json
timeout -v 60 python3 $root_dir/imager/main.py --image $root_dir/tmp/latest
