#!/bin/bash
# Auto-adjust brightness based on time of day

# Configuration - adjust these to your preference
DAY_BRIGHTNESS=1.0      # Daytime brightness (100%)
EVENING_BRIGHTNESS=0.8  # Evening brightness (80%)
NIGHT_BRIGHTNESS=0.6    # Night brightness (60%)

# Time configuration (24-hour format)
DAY_START=8        # Day starts at 8:00 AM
EVENING_START=18   # Evening starts at 6:00 PM
NIGHT_START=21     # Night starts at 9:00 PM

# Get current hour
CURRENT_HOUR=$(date +%H | sed 's/^0*//')  # Remove leading zeros

# Determine target brightness based on time
if [ $CURRENT_HOUR -ge $DAY_START ] && [ $CURRENT_HOUR -lt $EVENING_START ]; then
    TARGET_BRIGHTNESS=$DAY_BRIGHTNESS
    PERIOD="day"
elif [ $CURRENT_HOUR -ge $EVENING_START ] && [ $CURRENT_HOUR -lt $NIGHT_START ]; then
    TARGET_BRIGHTNESS=$EVENING_BRIGHTNESS
    PERIOD="evening"
else
    TARGET_BRIGHTNESS=$NIGHT_BRIGHTNESS
    PERIOD="night"
fi

# Set the brightness
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Brightness d $TARGET_BRIGHTNESS
printf "[%s] Set brightness to %.0f%% for %s time\n" "$(date +%H:%M)" $(echo "$TARGET_BRIGHTNESS * 100" | bc -l) "$PERIOD" 