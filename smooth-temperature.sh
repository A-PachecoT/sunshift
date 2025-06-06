#!/bin/bash
# Smoothly adjust color temperature based on time of day

# Configuration
DAY_TEMP=6500      # Daytime temperature
NIGHT_TEMP=2500    # Night temperature (very strong blue filter)

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

# Get target temperature
TARGET_TEMP=$(calculate_temp $CURRENT_TIME)

# Get current temperature
CURRENT_TEMP=$(busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Temperature | awk '{print $2}')

# Only update if significantly different (avoid constant small updates)
DIFF=$((TARGET_TEMP - CURRENT_TEMP))
if [ ${DIFF#-} -gt 50 ]; then  # If difference is more than 50K
    busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Temperature q $TARGET_TEMP
    echo "[$(date +%H:%M)] Adjusted temperature from ${CURRENT_TEMP}K to ${TARGET_TEMP}K"
else
    echo "[$(date +%H:%M)] Temperature ${CURRENT_TEMP}K is close to target ${TARGET_TEMP}K, no change needed"
fi 