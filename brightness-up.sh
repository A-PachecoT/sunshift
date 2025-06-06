#!/bin/bash
# Increase brightness by 10%
current=$(busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Brightness | awk '{print $2}')
new=$(echo "$current + 0.1" | bc -l)
# Cap at 1.0 (100%)
if (( $(echo "$new > 1.0" | bc -l) )); then
    new=1.0
fi
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Brightness d $new
printf "Brightness set to %.0f%%\n" $(echo "$new * 100" | bc -l) 