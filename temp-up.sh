#!/bin/bash
# Increase color temperature by 500K (cooler/bluer)
current=$(busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Temperature | awk '{print $2}')
new=$((current + 500))
# Cap at 6500K
if [ $new -gt 6500 ]; then
    new=6500
fi
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Temperature q $new
echo "Temperature set to ${new}K" 