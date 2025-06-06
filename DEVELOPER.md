# Developer Guide - Sunshift

Technical documentation for developers and advanced users.

## 📋 Table of Contents

- [[#architecture|Architecture]]
- [[#requirements|Requirements]]
- [[#installation-details|Installation Details]]
- [[#customization|Customization]]
- [[#dbus-interface|DBus Interface]]
- [[#script-details|Script Details]]
- [[#troubleshooting|Troubleshooting]]
- [[#contributing|Contributing]]

## Architecture

### System Overview

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│ Systemd Timer   │────▶│ Shell Script │────▶│ wl-gammarelay│
│ (every 5 min)   │     │ (smooth-temp)│     │   (daemon)   │
└─────────────────┘     └──────────────┘     └─────────────┘
                               │                      │
                               ▼                      ▼
                        ┌──────────────┐      ┌─────────────┐
                        │ Time Logic   │      │ DBus API    │
                        │ Calculations │      │ Properties  │
                        └──────────────┘      └─────────────┘
```

### Components

1. **wl-gammarelay** - Wayland compositor integration daemon
   - Provides DBus interface for color/brightness control
   - Works with wlr-gamma-control protocol
   - Single binary, no complex dependencies

2. **Systemd Integration**
   - `wl-gammarelay-auto.timer` - Triggers every 5 minutes
   - `wl-gammarelay-auto.service` - Runs smooth-temperature.sh

3. **Shell Scripts** - Modular control system
   - Time calculations using `bc` for floating-point math
   - DBus communication via `busctl`
   - POSIX-compliant for portability

## Requirements

### Dependencies

```bash
# Core
wl-gammarelay   # AUR package
bc              # GNU calculator for math
busctl          # Part of systemd

# Build dependencies (for AUR)
go              # wl-gammarelay is written in Go
wayland         # Wayland libraries
```

### Wayland Compositor Support

- ✅ **Hyprland** - Full support
- ✅ **Sway** - Full support  
- ✅ **River** - Full support
- ❓ **GNOME** - Untested (may conflict with built-in night light)
- ❓ **KDE** - Untested (may conflict with built-in color control)

## Installation Details

### Manual Installation Steps

```bash
# 1. Install wl-gammarelay from AUR
git clone https://aur.archlinux.org/wl-gammarelay.git
cd wl-gammarelay
makepkg -si

# 2. Install bc
sudo pacman -S bc

# 3. Clone this repository
git clone <repository-url> ~/projects/sunshift
cd ~/projects/sunshift

# 4. Run setup script
./setup.sh
```

### What setup.sh Does

1. Validates system (checks for pacman, yay)
2. Installs dependencies
3. Creates directories: `~/.config/hypr/scripts/`, `~/.config/systemd/user/`
4. Copies scripts with proper permissions
5. Updates paths in systemd service file
6. Enables and starts systemd timer
7. Runs initial temperature/brightness adjustment

### Hyprland Configuration

Add to `~/.config/hypr/userprefs.conf`:

```bash
# Startup
exec-once = wl-gammarelay
exec-once = sleep 2 && $HOME/.config/hypr/scripts/smooth-temperature.sh

# Keybindings ($mainMod is usually Super/Windows key)
bind = $mainMod, Prior, exec, $HOME/.config/hypr/scripts/temp-up.sh
bind = $mainMod, Next, exec, $HOME/.config/hypr/scripts/temp-down.sh
bind = $mainMod ALT, Prior, exec, $HOME/.config/hypr/scripts/brightness-up.sh
bind = $mainMod ALT, Next, exec, $HOME/.config/hypr/scripts/brightness-down.sh
```

## Customization

### Time-Based Settings

#### Simple Schedule (auto-temperature.sh, auto-brightness.sh)

```bash
# Temperature thresholds
DAY_TEMP=6500      # Kelvin
EVENING_TEMP=4500  
NIGHT_TEMP=3000    

# Time boundaries (24-hour)
DAY_START=8        # 8:00 AM
EVENING_START=18   # 6:00 PM
NIGHT_START=21     # 9:00 PM
```

#### Smooth Transitions (smooth-temperature.sh)

```bash
# Temperature range
DAY_TEMP=6500      
NIGHT_TEMP=2500    

# Brightness range
DAY_BRIGHTNESS=1.0     # 100%
NIGHT_BRIGHTNESS=0.6   # 60%

# Time settings (decimal hours)
SUNRISE=6.5        # 6:30 AM = 6 + 30/60
SUNSET=19.5        # 7:30 PM = 19 + 30/60
TRANSITION=1.5     # Hours for transition
```

### Manual Adjustment Settings

In `temp-up.sh` and `temp-down.sh`:
```bash
new=$((current + 500))  # Temperature step (Kelvin)
if [ $new -gt 6500 ]; then
    new=6500            # Maximum temperature
fi
```

In `brightness-up.sh` and `brightness-down.sh`:
```bash
new=$(echo "$current + 0.1" | bc -l)  # 10% step
if (( $(echo "$new > 1.0" | bc -l) )); then
    new=1.0             # Maximum 100%
fi
```

### Location-Based Sunrise/Sunset

To use actual sunrise/sunset times:

```bash
# Install sunwait
yay -S sunwait

# Modify smooth-temperature.sh
LATITUDE=40.7
LONGITUDE=-74.0
SUNRISE=$(sunwait list set $LATITUDE $LONGITUDE | cut -d' ' -f1)
SUNSET=$(sunwait list rise $LATITUDE $LONGITUDE | cut -d' ' -f1)
```

## DBus Interface

### wl-gammarelay DBus API

Service: `rs.wl-gammarelay`  
Object: `/`  
Interface: `rs.wl.gammarelay`

Properties:
- `Temperature` (uint16) - Color temperature in Kelvin
- `Brightness` (double) - Brightness multiplier (0.0-1.0)

### Direct DBus Commands

```bash
# Using busctl
busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Temperature
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Temperature q 5000

# Using dbus-send
dbus-send --session --print-reply --dest=rs.wl-gammarelay / \
    org.freedesktop.DBus.Properties.Get \
    string:"rs.wl.gammarelay" string:"Temperature"

# Monitor changes
busctl --user monitor rs.wl-gammarelay
```

## Script Details

### smooth-temperature.sh Algorithm

1. **Time Calculation**
   ```bash
   CURRENT_TIME=$(echo "$HOUR + $MINUTE/60" | bc -l)
   ```

2. **Transition Detection**
   - Dawn: `SUNRISE - TRANSITION` to `SUNRISE`
   - Day: `SUNRISE` to `SUNSET - TRANSITION`
   - Dusk: `SUNSET - TRANSITION` to `SUNSET`
   - Night: `SUNSET` to `SUNRISE - TRANSITION`

3. **Linear Interpolation**
   ```bash
   progress=$(echo "($time - $start) / $duration" | bc -l)
   value=$(echo "$start_val + ($end_val - $start_val) * $progress" | bc -l)
   ```

4. **Threshold Check**
   - Temperature: Only update if difference > 50K
   - Brightness: Only update if difference > 5%

### Performance Considerations

- Scripts run every 5 minutes (configurable in timer)
- Minimal resource usage (< 1MB RAM)
- No persistent processes except wl-gammarelay daemon
- DBus calls are atomic and fast

## Troubleshooting

### Common Issues

#### wl-gammarelay not starting

```bash
# Check if already running
pgrep -a wl-gammarelay

# Start manually with debug
WAYLAND_DEBUG=1 wl-gammarelay

# Check for port conflicts
lsof -i :9004  # Default wl-gammarelay port
```

#### DBus connection failures

```bash
# Verify DBus session
echo $DBUS_SESSION_BUS_ADDRESS

# Check if service is registered
busctl --user list | grep gammarelay

# Restart DBus session (last resort)
systemctl --user restart dbus
```

#### Temperature/brightness not changing

```bash
# Test manual control
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Temperature q 4000

# Check for errors
journalctl --user -u sunshift.service -n 50

# Verify calculations
bash -x ~/.config/hypr/scripts/smooth-temperature.sh
```

#### NVIDIA GPU issues

wl-gammarelay works with NVIDIA 545+ drivers. For older drivers:
```bash
# Check driver version
nvidia-smi --query-gpu=driver_version --format=csv,noheader

# Alternative: Use hyprsunset (Hyprland only)
hyprsunset -t 4500
```

### Debug Mode

Add to any script:
```bash
#!/bin/bash
set -x  # Enable debug output
set -e  # Exit on error
```

### Logs

```bash
# Systemd service logs
journalctl --user -u sunshift.service -f

# Timer status
systemctl --user status sunshift.timer

# All related logs
journalctl --user -t sunshift -t smooth-temperature
```

## Contributing

### Code Style

- POSIX-compliant shell scripts
- Meaningful variable names
- Comments for complex logic
- Error handling for external commands

### Testing

```bash
# Test suite (create test.sh)
#!/bin/bash
echo "Testing temperature calculations..."
./smooth-temperature.sh

echo "Testing brightness controls..."
./brightness-up.sh
sleep 1
./brightness-down.sh

echo "Testing DBus interface..."
busctl --user introspect rs.wl-gammarelay /
```

### Submitting Changes

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Test thoroughly on your system
4. Submit pull request with:
   - Description of changes
   - Test results
   - Any new dependencies

### Future Enhancements

- [ ] Geolocation-based sunrise/sunset
- [ ] GUI configuration tool
- [ ] Integration with desktop environments
- [ ] Multiple monitor support with different settings
- [ ] Transition curves (ease-in/out)
- [ ] Holiday/weekend schedules

## Related Projects

- [[README.md]] - User documentation
- [wl-gammarelay](https://github.com/jeremija/wl-gammarelay) - Upstream project
- [wlsunset](https://sr.ht/~kennylevinsen/wlsunset/) - Alternative (no brightness)
- [gammastep](https://gitlab.com/chinstrap/gammastep) - Alternative (GAMMA_LUT issues)
- [f.lux](https://justgetflux.com/) - Inspiration for Sunshift 