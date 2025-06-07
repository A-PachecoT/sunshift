#!/bin/bash
# Sunshift Waybar Widget Script
# Displays current color temperature and brightness in Waybar

# Colors for different temperature ranges
get_temp_icon() {
    local temp=$1
    if [ $temp -le 3000 ]; then
        echo "🌙"  # Night mode
    elif [ $temp -le 4000 ]; then
        echo "🌅"  # Evening
    elif [ $temp -le 5000 ]; then
        echo "🌇"  # Sunset
    else
        echo "☀️"  # Day
    fi
}

get_brightness_icon() {
    local brightness=$1
    local brightness_percent=$(echo "$brightness * 100" | bc -l)
    local brightness_int=${brightness_percent%.*}
    
    if [ $brightness_int -le 30 ]; then
        echo "🔅"  # Low brightness
    elif [ $brightness_int -le 70 ]; then
        echo "🔆"  # Medium brightness
    else
        echo "☀️"  # High brightness
    fi
}

# Check if wl-gammarelay is running
if ! pgrep -x wl-gammarelay > /dev/null; then
    echo '{"text": "Sunshift: Off", "class": "disconnected", "tooltip": "wl-gammarelay is not running"}'
    exit 0
fi

# Get current values from wl-gammarelay
TEMP=$(busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Temperature 2>/dev/null | awk '{print $2}')
BRIGHTNESS=$(busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Brightness 2>/dev/null | awk '{print $2}')

# Check if we got valid values
if [ -z "$TEMP" ] || [ -z "$BRIGHTNESS" ]; then
    echo '{"text": "Sunshift: Error", "class": "error", "tooltip": "Failed to get values from wl-gammarelay"}'
    exit 1
fi

# Calculate brightness percentage
BRIGHTNESS_PERCENT=$(echo "$BRIGHTNESS * 100" | bc -l | cut -d. -f1)

# Get appropriate icons
TEMP_ICON=$(get_temp_icon $TEMP)
BRIGHTNESS_ICON=$(get_brightness_icon $BRIGHTNESS)

# Determine CSS class based on temperature
CSS_CLASS="normal"
if [ $TEMP -le 3000 ]; then
    CSS_CLASS="night"
elif [ $TEMP -le 4000 ]; then
    CSS_CLASS="evening"
elif [ $TEMP -ge 6000 ]; then
    CSS_CLASS="day"
fi

# Format text for display
DISPLAY_TEXT="${TEMP_ICON} ${TEMP}K ${BRIGHTNESS_ICON} ${BRIGHTNESS_PERCENT}%"

# Create tooltip with more detailed info
TOOLTIP="Temperature: ${TEMP}K\\nBrightness: ${BRIGHTNESS_PERCENT}%\\n\\nClick to open Sunshift controls"

# Output JSON for Waybar
echo "{\"text\": \"$DISPLAY_TEXT\", \"class\": \"$CSS_CLASS\", \"tooltip\": \"$TOOLTIP\"}" 