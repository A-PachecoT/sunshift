#!/bin/bash
# Decrease brightness by 10%
current=$(busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Brightness | awk '{print $2}')
new=$(echo "$current - 0.1" | bc -l)
# Floor at 0.1 (10% minimum to avoid black screen)
if (( $(echo "$new < 0.1" | bc -l) )); then
    new=0.1
fi
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Brightness d $new
printf "Brightness set to %.0f%%\n" $(echo "$new * 100" | bc -l) 