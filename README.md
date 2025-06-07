# Sunshift

Automatic color temperature and brightness adjustment for Wayland compositors using wl-gammarelay. Provides time-based blue light filtering and brightness control with smooth transitions.

## ✨ Features

- 🌅 **Time-based adjustment** - Automatic color/brightness based on sunrise/sunset
- 🌊 **Smooth transitions** - Gradual 1.5-hour transitions
- 💡 **Dual control** - Both temperature and brightness management
- ⌨️ **Keyboard shortcuts** - Instant manual adjustments
- 🖥️ **NVIDIA-compatible** - Works where gammastep/wlsunset fail

## 🚀 Quick Start

```bash
./setup.sh
```

This fully automates the installation:
- Installs wl-gammarelay from AUR 
- Copies all scripts including Waybar widget
- Sets up systemd timer for automatic adjustments
- Configures proper permissions and paths

**Everything is automated** - no manual configuration required for core functionality!

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Super + PageUp` | Cooler temperature (+500K) |
| `Super + PageDown` | Warmer temperature (-500K) |
| `Alt + PageUp` | Brighter (+10%) |
| `Alt + PageDown` | Dimmer (-10%) |

## 📊 Status Bar Widget

Sunshift includes a Waybar widget for live temperature and brightness display in your status bar.

**Automated Setup:**
1. Run `./setup.sh` - automatically installs widget script
2. Add to your `~/.config/waybar/config.json`:
   ```json
   "custom/sunshift": {
       "exec": "~/.config/hypr/scripts/sunshift-widget.sh",
       "interval": 30,
       "return-type": "json",
       "format": "{}",
       "on-click": "pkill -f sunshift-ui || sunshift-ui",
       "on-click-right": "~/.config/hypr/scripts/temp-up.sh",
       "on-click-middle": "~/.config/hypr/scripts/brightness-up.sh"
   }
   ```
3. Add widget styling from `waybar-sunshift-style.css` to your `style.css`
4. Restart Waybar: `pkill waybar && waybar &`

The widget displays: `☀️ 6500K ☀️ 100%` with temperature-based colors and click actions.

See [[WAYBAR_WIDGET.md]] for complete setup and customization guide.

## ⚙️ Configuration

### Default Schedule
- **Day** (8AM-6PM): 6500K, 100% brightness
- **Evening** (6PM-9PM): 4500K, 80% brightness  
- **Night** (9PM-8AM): 3000K, 60% brightness

### Smooth Transitions
- **Sunrise**: 6:30 AM ± 1.5 hours
- **Sunset**: 7:30 PM ± 1.5 hours
- **Day/Night**: 6500K/2500K, 100%/60% brightness

See [[DEVELOPER.md]] for customization details.

## 📁 Scripts Overview

| Script | Purpose |
|--------|---------|
| `smooth-temperature.sh` | Main script with smooth transitions for both temp & brightness |
| `auto-temperature.sh` | Simple time-based temperature adjustment |
| `auto-brightness.sh` | Simple time-based brightness adjustment |
| `temp-up/down.sh` | Manual temperature control |
| `brightness-up/down.sh` | Manual brightness control |

## 📦 Hyprland Configuration
Recommended configuration for Hyprland:
```bash
# Auto-start wl-gammarelay
exec-once = wl-gammarelay
exec-once = sleep 2 && $HOME/.config/hypr/scripts/smooth-temperature.sh

# Keyboard shortcuts for manual adjustment
bind = $mainMod, Prior, exec, $HOME/.config/hypr/scripts/temp-up.sh   # Super+PageUp for temperature up
bind = $mainMod, Next, exec, $HOME/.config/hypr/scripts/temp-down.sh  # Super+PageDown for temperature down
bind = $mainMod, ALT, Prior, exec, $HOME/.config/hypr/scripts/brightness-up.sh   # Super+Alt+PageUp for brightness up
bind = $mainMod, ALT, Next, exec, $HOME/.config/hypr/scripts/brightness-down.sh  # Super+Alt+PageDown for brightness down
```

## 🔧 Quick Commands

```bash
# Check current values
busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Temperature
busctl --user get-property rs.wl-gammarelay / rs.wl.gammarelay Brightness

# Set specific values
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Temperature q 4000
busctl --user set-property rs.wl-gammarelay / rs.wl.gammarelay Brightness d 0.8

# Monitor Sunshift
systemctl --user status sunshift.timer
journalctl --user -u sunshift.service -f
```

## 📊 Reference

### Temperature Scale
- `6500K` - Neutral daylight
- `4500K` - Warm evening
- `3000K` - Very warm
- `2500K` - Strong blue filter

### Brightness Scale
- `1.0` - 100% Full brightness
- `0.8` - 80% Mixed lighting
- `0.6` - 60% Evening
- `0.1` - 10% Minimum

## 🐛 Troubleshooting

See [[DEVELOPER.md#troubleshooting]] for detailed solutions.

## 📚 Documentation

- [[DEVELOPER.md]] - Technical details, customization, architecture
- [[WAYBAR_WIDGET.md]] - Status bar widget setup and customization
- [[setup.sh]] - Installation script source
- [[smooth-temperature.sh]] - Main automation script

## 📄 License

This project is provided as-is for personal use. 