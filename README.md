# Hyprland Utility Scripts

Clean, essential scripts for Hyprland with **clipse** - a reliable clipboard manager.

## 📋 Clipboard & Portal Scripts

### `clipboard-restart.sh`
**Clipse clipboard restart** - Simple and reliable clipboard service restart
- Stops any existing clipse processes
- Clears cache if needed
- Ensures desktop portals are running
- Restarts clipse in listening mode
- Tests clipboard functionality
- Bound to `Super+Alt+V` keybinding

### `fix-clipboard-complete.sh`
**Legacy clipboard fix** - For emergency clipboard fixes
- Kills all conflicting clipboard processes
- Ensures desktop portals are running
- Can be used as fallback if clipse has issues

### `fix-electron-clipboard-dbus.sh`
**Electron/DBus crash fix** - Fixes Cursor crashes and clipboard issues with Electron apps
- Cleans up duplicate portal processes
- Fixes DBus session conflicts
- Sets proper Electron environment variables
- Creates electron-wayland wrapper for stability
- Bound to `Super+Ctrl+E` keybinding

### `cursor-stability-fix.sh`
**Cursor IDE stability fixes** - Prevents Cursor crashes on Hyprland
- Creates cursor-stable wrapper with Wayland fixes
- Disables problematic GPU features
- Sets proper memory limits
- Adds desktop entry and shell aliases
- Provides tips to prevent crashes

### `cursor-safe-paste.sh`
**Cursor wrapper with clipboard protection** - Prevents Cursor crashes when pasting
- Ensures clipse is running before starting Cursor
- Sets environment variables for stable clipboard operation
- Monitors clipboard size and warns about large content
- Includes all stability fixes from cursor-stability-fix.sh

### `test-clipboard.sh`
**Clipboard diagnostic tool** - Test if clipboard is working properly
- Tests basic copy/paste
- Shows service status
- Checks clipboard functionality

### `autostart-clipboard.sh`
**Clipboard autostart** - Runs on Hyprland startup (configured in userprefs.conf)
- Starts clipse in listening mode
- Simple, reliable clipboard setup
- No complex monitoring or systemd services

### `restart-portals.sh`
**Portal restart utility** - Fixes desktop portal issues
- Restarts xdg-desktop-portal services
- Required for app integration (Cursor, Obsidian, etc.)
- Bound to `Super+Ctrl+V` keybinding

### `diagnose-portals.sh`
**Portal diagnostic tool** - Comprehensive portal and graphics diagnostics
- Checks portal services
- Tests clipboard functionality
- Shows NVIDIA status
- Provides quick fixes

## 🚀 Other Utilities

### `launch-or-focus-obsidian.sh`
**Smart Obsidian launcher** - Launch or focus existing Obsidian window
- If Obsidian is running, switches to its workspace
- If not running, launches it
- Prevents duplicate instances

## 🎮 Clipboard Manager - Clipse

**Why clipse instead of cliphist?**
- Single binary architecture (more reliable)
- Built-in TUI interface (no rofi dependency)
- Better Wayland integration
- Handles both text and images automatically
- No service crashes or "clipboard not running" issues

### Usage
```bash
# Copy text or images normally (Ctrl+C)

# Open clipboard manager
Super+V  # Opens clipse TUI

# Navigate in clipse
↑/↓      # Navigate entries
Enter    # Select and copy
Delete   # Remove entry
Ctrl+C   # Exit
/        # Search
Tab      # Toggle between text/image view
```

### Configuration
- Config: `~/.config/clipse/config.json`
- Theme: `~/.config/clipse/custom_theme.json`
- History: `~/.cache/clipse/history.json`

## 🔧 Common Tasks

```bash
# Restart clipboard service
./scripts/clipboard-restart.sh
# or press: Super+Alt+V

# Fix Electron app crashes (Cursor, Discord, etc.)
./scripts/fix-electron-clipboard-dbus.sh
# or press: Super+Ctrl+E

# Make Cursor stable with clipboard protection
./scripts/cursor-safe-paste.sh
# or use alias: cursor-safe

# Test clipboard
./scripts/test-clipboard.sh

# Fix app integration issues (Cursor, Obsidian crashes)
./scripts/restart-portals.sh
# or press: Super+Ctrl+V
```

## 🎹 Keybindings

- `Super+V` - Open clipse clipboard manager
- `Super+Shift+V` - Open clipse (same as above)
- `Super+Alt+V` - Restart clipboard service
- `Super+Ctrl+V` - Restart portals
- `Super+Ctrl+E` - Fix Electron/DBus issues

## 📝 Notes

- Clipse automatically handles both text and images
- No need for separate text/image clipboard monitors
- Window rules make clipse appear as a floating 800x600 centered window
- Custom dark theme included for better visual integration
- If clipboard stops working, just press `Super+Alt+V` to restart clipse 