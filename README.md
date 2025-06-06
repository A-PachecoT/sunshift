# wl-gammarelay Auto Color Temperature & Brightness System

Automatic color temperature and brightness adjustment for Wayland compositors using wl-gammarelay. Provides time-based blue light filtering and brightness control with smooth transitions and manual controls.

## Features

- 🌅 **Automatic time-based adjustment** - Changes color temperature and brightness based on time of day
- 🌊 **Smooth transitions** - Gradual changes during sunrise/sunset periods
- 💡 **Brightness control** - Manage monitor brightness alongside color temperature
- ⌨️ **Manual controls** - Keyboard shortcuts for instant adjustments
- 🔧 **Fully customizable** - Easy to modify times, temperatures, and brightness levels
- 🖥️ **NVIDIA-compatible** - Works with NVIDIA GPUs on Wayland (unlike gammastep/wlsunset)

## Requirements

- **Arch Linux** (or AUR-compatible distribution)
- **Wayland compositor** (tested with Hyprland)
- **yay** (AUR helper)
- **bc** (basic calculator for smooth transitions)
- **systemd** (for automatic scheduling)

## Installation

Run the setup script:

```bash
./setup.sh
```

This will:
1. Install wl-gammarelay from AUR
2. Install bc for calculations
3. Copy all scripts to `~/.config/hypr/scripts/`
4. Install and enable systemd timer for automatic adjustments
5. Show you the configuration to add to your Hyprland config

## Manual Installation

If you prefer to install manually:

```bash
# Install dependencies
yay -S wl-gammarelay
sudo pacman -S bc

# Copy scripts
cp {temp-up.sh,temp-down.sh,brightness-up.sh,brightness-down.sh,auto-temperature.sh,auto-brightness.sh,smooth-temperature.sh} ~/.config/hypr/scripts/
chmod +x ~/.config/hypr/scripts/*.sh

# Install systemd services
cp wl-gammarelay-auto.{service,timer} ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now wl-gammarelay-auto.timer
```

## Configuration

### Hyprland Configuration

Add to your `~/.config/hypr/userprefs.conf` or `hyprland.conf`:

```bash
# Auto-start wl-gammarelay
exec-once = wl-gammarelay
exec-once = sleep 2 && $HOME/.config/hypr/scripts/smooth-temperature.sh

# Color temperature controls
bind = $mainMod, Prior, exec, $HOME/.config/hypr/scripts/temp-up.sh   # Super+PageUp - Cooler
bind = $mainMod, Next, exec, $HOME/.config/hypr/scripts/temp-down.sh  # Super+PageDown - Warmer

# Brightness controls
bind = $mainMod ALT, Prior, exec, $HOME/.config/hypr/scripts/brightness-up.sh   # Alt+PageUp - Brighter
bind = $mainMod ALT, Next, exec, $HOME/.config/hypr/scripts/brightness-down.sh  # Alt+PageDown - Dimmer
```

### Customizing Color Temperature

#### Simple Schedule (`auto-temperature.sh`)

Edit the variables at the top of the script:

```bash
# Temperature settings
DAY_TEMP=6500      # Daytime temperature (6500K = neutral)
EVENING_TEMP=4500  # Evening temperature (4500K = warm)
NIGHT_TEMP=3000    # Night temperature (3000K = very warm)

# Time settings (24-hour format)
DAY_START=8        # Day starts at 8:00 AM
EVENING_START=18   # Evening starts at 6:00 PM
NIGHT_START=21     # Night starts at 9:00 PM
```

#### Smooth Transitions (`smooth-temperature.sh`)

Edit the variables at the top of the script:

```bash
# Temperature settings
DAY_TEMP=6500      # Daytime temperature
NIGHT_TEMP=2500    # Night temperature (lower = stronger blue filter)

# Brightness settings
DAY_BRIGHTNESS=1.0      # Daytime brightness (100%)
NIGHT_BRIGHTNESS=0.6    # Night brightness (60%)

# Time settings (decimal hours)
SUNRISE=6.5        # 6:30 AM (6 hours + 30/60)
SUNSET=19.5        # 7:30 PM (19 hours + 30/60)
TRANSITION=1.5     # Transition duration in hours
```

### Customizing Brightness

#### Simple Schedule (`auto-brightness.sh`)

Edit the variables at the top of the script:

```bash
# Brightness settings
DAY_BRIGHTNESS=1.0      # Daytime brightness (100%)
EVENING_BRIGHTNESS=0.8  # Evening brightness (80%)
NIGHT_BRIGHTNESS=0.6    # Night brightness (60%)

# Time settings match auto-temperature.sh
```

#### Manual Adjustment Settings

Edit `brightness-up.sh` and `brightness-down.sh` to change:
- Brightness step size (default: 10%)
- Maximum brightness (default: 100%)
- Minimum brightness (default: 10%)

## Usage

### Automatic Operation

The systemd timer runs every 5 minutes to adjust both temperature and brightness based on time of day.

### Manual Controls

#### Color Temperature
- **Super + Page Up**: Increase temperature by 500K (cooler/bluer)
- **Super + Page Down**: Decrease temperature by 500K (warmer/redder)

#### Brightness
- **Alt + Page Up**: Increase brightness by 10%
- **Alt + Page Down**: Decrease brightness by 10%

### Direct Commands

```bash
# Set specific temperature
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Temperature q 4000

# Set specific brightness (0.0 to 1.0)
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Brightness d 0.8

# Check current values
busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Temperature
busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Brightness

# Run adjustments manually
~/.config/hypr/scripts/smooth-temperature.sh
~/.config/hypr/scripts/auto-brightness.sh
```

### Monitor the System

```bash
# Check timer status
systemctl --user status wl-gammarelay-auto.timer

# View recent adjustments
journalctl --user -u wl-gammarelay-auto.service -f

# Check if wl-gammarelay is running
pgrep -a wl-gammarelay
```

## Reference Guide

### Temperature Scale
- **6500K**: Neutral daylight (no color adjustment)
- **5500K**: Slightly warm
- **4500K**: Warm (good for evening)
- **3500K**: Very warm (good for late evening)
- **2500K**: Extremely warm (strong blue filter for night)
- **2000K**: Maximum warmth (very strong blue filter)

### Brightness Scale
- **100%** (1.0): Full brightness for daytime work
- **80%** (0.8): Comfortable for mixed lighting
- **60%** (0.6): Good for evening/low light
- **40%** (0.4): Very dim for dark environments
- **10%** (0.1): Minimum safe brightness

## Troubleshooting

### wl-gammarelay not starting
```bash
# Start manually
wl-gammarelay &

# Check for errors
journalctl --user -u wl-gammarelay-auto.service
```

### Temperature or brightness not changing
```bash
# Check if daemon is running
busctl --user introspect rs.wl-gammarelay /

# Restart the daemon
pkill wl-gammarelay && wl-gammarelay &

# Test manual adjustment
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Temperature q 5000
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Brightness d 0.7
```

### Systemd timer not working
```bash
# Check timer status
systemctl --user list-timers wl-gammarelay-auto.timer

# Restart timer
systemctl --user restart wl-gammarelay-auto.timer
```

## Uninstall

```bash
# Disable systemd timer
systemctl --user disable --now wl-gammarelay-auto.timer

# Remove systemd files
rm ~/.config/systemd/user/wl-gammarelay-auto.{service,timer}

# Remove scripts
rm ~/.config/hypr/scripts/{temp-up.sh,temp-down.sh,brightness-up.sh,brightness-down.sh,auto-temperature.sh,auto-brightness.sh,smooth-temperature.sh}

# Uninstall wl-gammarelay (optional)
yay -R wl-gammarelay
```

## License

This project is provided as-is for personal use. 