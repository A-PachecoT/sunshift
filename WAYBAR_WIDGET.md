# Sunshift Waybar Widget Integration

This guide explains how to add a Sunshift widget to your Waybar status bar on Hyprland.

## 🖥️ Widget Features

- **Live Display**: Shows current temperature (K) and brightness (%)
- **Visual Indicators**: Temperature-based icons and colors
- **Interactive**: Click actions for quick controls
- **Smart Updates**: 30-second refresh interval
- **Error Handling**: Shows status when wl-gammarelay is offline

## 📁 Files Included

- `sunshift-widget.sh` - Main widget script
- `waybar-config-example.json` - Example Waybar configuration
- `waybar-sunshift-style.css` - Widget styling

## 🚀 Installation

### 1. Automatic (Recommended)
If you haven't already, run the setup script which now includes the widget:
```bash
./setup.sh
```

### 2. Manual Installation
Copy the widget script to your scripts directory:
```bash
cp sunshift-widget.sh ~/.config/hypr/scripts/
chmod +x ~/.config/hypr/scripts/sunshift-widget.sh
```

## ⚙️ Configuration

### 1. Waybar Configuration

Add the sunshift module to your `~/.config/waybar/config.json`:

```json
{
    "modules-right": ["pulseaudio", "network", "custom/sunshift", "battery", "tray"],
    
    "custom/sunshift": {
        "exec": "~/.config/hypr/scripts/sunshift-widget.sh",
        "interval": 30,
        "return-type": "json",
        "format": "{}",
        "on-click": "pkill -f sunshift-ui || sunshift-ui",
        "on-click-right": "~/.config/hypr/scripts/temp-up.sh",
        "on-click-middle": "~/.config/hypr/scripts/brightness-up.sh"
    }
}
```

### 2. Waybar Styling

Add the Sunshift widget styling to your `~/.config/waybar/style.css`. You have two options:

**Option A: Copy Content (Recommended)**
Append the content from `waybar-sunshift-style.css` to the end of your `~/.config/waybar/style.css`:

```bash
cat waybar-sunshift-style.css >> ~/.config/waybar/style.css
```

**Option B: CSS Import**
Copy `waybar-sunshift-style.css` to your Waybar config directory and import it:
```bash
cp waybar-sunshift-style.css ~/.config/waybar/
```
Then add this line to your `style.css`:
```css
@import "waybar-sunshift-style.css";
```

### 3. Complete Example

Use `waybar-config-example.json` as a starting point for a complete Waybar configuration with the Sunshift widget included.

## 🎨 Widget Display

The widget shows information in this format:
```
🌙 3000K 🔅 60%
```

### Icons by State

**Temperature Icons:**
- ☀️ Day mode (6000K+)
- 🌇 Sunset (5000-6000K)
- 🌅 Evening (4000-5000K)
- 🌙 Night mode (≤3000K)

**Brightness Icons:**
- ☀️ High brightness (70%+)
- 🔆 Medium brightness (30-70%)
- 🔅 Low brightness (≤30%)

### Color Coding

- **Blue**: Day mode (6000K+)
- **Orange**: Evening mode (4000-6000K) 
- **Red**: Night mode (≤4000K)
- **Gray**: Disconnected/Error

## 🖱️ Click Actions

- **Left Click**: Toggle Sunshift GUI (if available)
- **Right Click**: Increase temperature (+500K)
- **Middle Click**: Increase brightness (+10%)

## 🔧 Customization

### Update Interval
Change the `interval` value in your Waybar config:
```json
"custom/sunshift": {
    "interval": 15,  // Update every 15 seconds
    ...
}
```

### Click Actions
Modify the click commands in your Waybar config:
```json
"custom/sunshift": {
    "on-click": "your-custom-command",
    "on-click-right": "~/.config/hypr/scripts/temp-down.sh",
    "on-click-middle": "~/.config/hypr/scripts/brightness-down.sh"
}
```

### Icons
Edit the icon functions in `sunshift-widget.sh`:
```bash
get_temp_icon() {
    local temp=$1
    if [ $temp -le 3000 ]; then
        echo "🌙"  # Change this icon
    # ... etc
}
```

### Colors
Modify the CSS classes in `waybar-sunshift-style.css`:
```css
#custom-sunshift.night {
    background-color: rgba(255, 118, 117, 0.2);
    color: #ff7675;  /* Change this color */
    /* ... */
}
```

## 🐛 Troubleshooting

### Widget Not Appearing
1. Check that the script is executable:
   ```bash
   ls -la ~/.config/hypr/scripts/sunshift-widget.sh
   ```

2. Test the script manually:
   ```bash
   ~/.config/hypr/scripts/sunshift-widget.sh
   ```

3. Check Waybar logs:
   ```bash
   waybar -l debug
   ```

### "Sunshift: Off" Message
- Ensure wl-gammarelay is running:
  ```bash
  pgrep -x wl-gammarelay
  ```
- Start it if needed:
  ```bash
  wl-gammarelay &
  ```

### "Sunshift: Error" Message
- Check DBus connectivity:
  ```bash
  busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Temperature
  ```

### Wrong Colors/Icons
- Verify the temperature and brightness values:
  ```bash
  ~/.config/hypr/scripts/sunshift-widget.sh | jq
  ```

## 🔄 Restart Waybar

After making configuration changes:
```bash
pkill waybar && waybar &
```

Or if using systemd:
```bash
systemctl --user restart waybar
```

## 📝 Example Output

```json
{
  "text": "🌙 3000K 🔅 60%",
  "class": "night",
  "tooltip": "Temperature: 3000K\nBrightness: 60%\n\nClick to open Sunshift controls"
}
```

The widget integrates seamlessly with your existing Waybar setup and provides at-a-glance information about your current color temperature and brightness settings. 