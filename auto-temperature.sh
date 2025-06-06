#!/bin/bash
# Auto-adjust color temperature based on time of day

# Configuration - adjust these to your preference
DAY_TEMP=6500      # Daytime temperature (6500K = neutral)
EVENING_TEMP=4500  # Evening temperature (4500K = warm)
NIGHT_TEMP=3000    # Night temperature (3000K = very warm, strong blue filter)

# Time configuration (24-hour format)
DAY_START=8        # Day starts at 8:00 AM
EVENING_START=18   # Evening starts at 6:00 PM
NIGHT_START=21     # Night starts at 9:00 PM

# Get current hour
CURRENT_HOUR=$(date +%H | sed 's/^0*//')  # Remove leading zeros

# Determine target temperature based on time
if [ $CURRENT_HOUR -ge $DAY_START ] && [ $CURRENT_HOUR -lt $EVENING_START ]; then
    TARGET_TEMP=$DAY_TEMP
    PERIOD="day"
elif [ $CURRENT_HOUR -ge $EVENING_START ] && [ $CURRENT_HOUR -lt $NIGHT_START ]; then
    TARGET_TEMP=$EVENING_TEMP
    PERIOD="evening"
else
    TARGET_TEMP=$NIGHT_TEMP
    PERIOD="night"
fi

# Set the temperature
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Temperature q $TARGET_TEMP
echo "[$(date +%H:%M)] Set temperature to ${TARGET_TEMP}K for ${PERIOD} time" 