#!/bin/bash
# Sunshift - Smoothly adjust color temperature and brightness based on time of day

# Configuration
DAY_TEMP=6500      # Daytime temperature
NIGHT_TEMP=2500    # Night temperature (very strong blue filter)

DAY_BRIGHTNESS=1.0     # Daytime brightness (100%)
NIGHT_BRIGHTNESS=0.6   # Night brightness (60%)

# Time configuration (in decimal hours for easier math)
SUNRISE=6.5        # 6:30 AM
SUNSET=19.5        # 7:30 PM
TRANSITION=1.5     # Transition duration in hours

# Get current time as decimal hour
HOUR=$(date +%H)
MINUTE=$(date +%M)
CURRENT_TIME=$(echo "$HOUR + $MINUTE/60" | bc -l)

# Calculate target temperature
calculate_temp() {
    local time=$1
    
    # Dawn transition (sunrise - transition to sunrise)
    local dawn_start=$(echo "$SUNRISE - $TRANSITION" | bc -l)
    if (( $(echo "$time >= $dawn_start && $time < $SUNRISE" | bc -l) )); then
        # Transition from night to day
        local progress=$(echo "($time - $dawn_start) / $TRANSITION" | bc -l)
        local temp=$(echo "$NIGHT_TEMP + ($DAY_TEMP - $NIGHT_TEMP) * $progress" | bc -l)
        echo ${temp%.*}  # Remove decimals
        return
    fi
    
    # Day time (sunrise to sunset - transition)
    local dusk_start=$(echo "$SUNSET - $TRANSITION" | bc -l)
    if (( $(echo "$time >= $SUNRISE && $time < $dusk_start" | bc -l) )); then
        echo $DAY_TEMP
        return
    fi
    
    # Dusk transition (sunset - transition to sunset)
    if (( $(echo "$time >= $dusk_start && $time < $SUNSET" | bc -l) )); then
        # Transition from day to night
        local progress=$(echo "($time - $dusk_start) / $TRANSITION" | bc -l)
        local temp=$(echo "$DAY_TEMP - ($DAY_TEMP - $NIGHT_TEMP) * $progress" | bc -l)
        echo ${temp%.*}  # Remove decimals
        return
    fi
    
    # Night time
    echo $NIGHT_TEMP
}

# Calculate target brightness
calculate_brightness() {
    local time=$1
    
    # Dawn transition
    local dawn_start=$(echo "$SUNRISE - $TRANSITION" | bc -l)
    if (( $(echo "$time >= $dawn_start && $time < $SUNRISE" | bc -l) )); then
        local progress=$(echo "($time - $dawn_start) / $TRANSITION" | bc -l)
        echo "$NIGHT_BRIGHTNESS + ($DAY_BRIGHTNESS - $NIGHT_BRIGHTNESS) * $progress" | bc -l
        return
    fi
    
    # Day time
    local dusk_start=$(echo "$SUNSET - $TRANSITION" | bc -l)
    if (( $(echo "$time >= $SUNRISE && $time < $dusk_start" | bc -l) )); then
        echo $DAY_BRIGHTNESS
        return
    fi
    
    # Dusk transition
    if (( $(echo "$time >= $dusk_start && $time < $SUNSET" | bc -l) )); then
        local progress=$(echo "($time - $dusk_start) / $TRANSITION" | bc -l)
        echo "$DAY_BRIGHTNESS - ($DAY_BRIGHTNESS - $NIGHT_BRIGHTNESS) * $progress" | bc -l
        return
    fi
    
    # Night time
    echo $NIGHT_BRIGHTNESS
}

# Get target values
TARGET_TEMP=$(calculate_temp $CURRENT_TIME)
TARGET_BRIGHTNESS=$(calculate_brightness $CURRENT_TIME)

# Get current values
CURRENT_TEMP=$(busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Temperature | awk '{print $2}')
CURRENT_BRIGHTNESS=$(busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Brightness | awk '{print $2}')

# Update temperature if significantly different
TEMP_DIFF=$((TARGET_TEMP - CURRENT_TEMP))
if [ ${TEMP_DIFF#-} -gt 50 ]; then  # If difference is more than 50K
    busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Temperature q $TARGET_TEMP
    echo "[$(date +%H:%M)] Temperature: ${CURRENT_TEMP}K → ${TARGET_TEMP}K"
else
    echo "[$(date +%H:%M)] Temperature: ${CURRENT_TEMP}K (target ${TARGET_TEMP}K, no change needed)"
fi

# Update brightness if significantly different
BRIGHTNESS_DIFF=$(echo "($TARGET_BRIGHTNESS - $CURRENT_BRIGHTNESS) * 100" | bc -l)
BRIGHTNESS_DIFF=${BRIGHTNESS_DIFF%.*}  # Convert to integer
if [ ${BRIGHTNESS_DIFF#-} -gt 5 ]; then  # If difference is more than 5%
    busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Brightness d $TARGET_BRIGHTNESS
    printf "[%s] Brightness: %.0f%% → %.0f%%\n" "$(date +%H:%M)" \
        $(echo "$CURRENT_BRIGHTNESS * 100" | bc -l) \
        $(echo "$TARGET_BRIGHTNESS * 100" | bc -l)
else
    printf "[%s] Brightness: %.0f%% (target %.0f%%, no change needed)\n" "$(date +%H:%M)" \
        $(echo "$CURRENT_BRIGHTNESS * 100" | bc -l) \
        $(echo "$TARGET_BRIGHTNESS * 100" | bc -l)
fi 