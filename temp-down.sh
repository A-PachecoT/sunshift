#!/bin/bash
# Decrease color temperature by 500K (warmer/redder)
current=$(busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Temperature | awk '{print $2}')
new=$((current - 500))
# Cap at 2000K minimum
if [ $new -lt 2000 ]; then
    new=2000
fi
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Temperature q $new
echo "Temperature set to ${new}K" 