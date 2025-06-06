#!/bin/bash

# wl-gammarelay Auto Color Temperature System - Setup Script
# This script installs and configures automatic color temperature adjustment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running on Arch-based system
if ! command -v pacman &> /dev/null; then
    print_error "This script requires an Arch-based system with pacman"
    exit 1
fi

# Check if yay is installed
if ! command -v yay &> /dev/null; then
    print_error "yay is not installed. Please install yay first:"
    echo "git clone https://aur.archlinux.org/yay.git && cd yay && makepkg -si"
    exit 1
fi

print_info "Starting wl-gammarelay auto color temperature system installation..."

# Install dependencies
print_info "Installing dependencies..."

# Install bc if not present
if ! command -v bc &> /dev/null; then
    print_info "Installing bc..."
    sudo pacman -S --needed --noconfirm bc
else
    print_info "bc is already installed"
fi

# Install wl-gammarelay from AUR
if ! command -v wl-gammarelay &> /dev/null; then
    print_info "Installing wl-gammarelay from AUR..."
    yay -S --needed --noconfirm wl-gammarelay
else
    print_info "wl-gammarelay is already installed"
fi

# Create necessary directories
print_info "Creating directories..."
mkdir -p ~/.config/hypr/scripts
mkdir -p ~/.config/systemd/user

# Copy scripts
print_info "Installing scripts..."
cp {temp-up.sh,temp-down.sh,auto-temperature.sh,smooth-temperature.sh} ~/.config/hypr/scripts/
chmod +x ~/.config/hypr/scripts/{temp-up.sh,temp-down.sh,auto-temperature.sh,smooth-temperature.sh}

# Update systemd service file with correct path
print_info "Installing systemd services..."
sed "s|/home/andre|$HOME|g" wl-gammarelay-auto.service > ~/.config/systemd/user/wl-gammarelay-auto.service
cp wl-gammarelay-auto.timer ~/.config/systemd/user/

# Reload systemd
print_info "Configuring systemd..."
systemctl --user daemon-reload

# Enable and start the timer
systemctl --user enable wl-gammarelay-auto.timer
systemctl --user start wl-gammarelay-auto.timer

# Check if wl-gammarelay is running
if ! pgrep -x wl-gammarelay > /dev/null; then
    print_info "Starting wl-gammarelay daemon..."
    wl-gammarelay &
    sleep 2
fi

# Set initial temperature
print_info "Setting initial temperature..."
~/.config/hypr/scripts/smooth-temperature.sh

print_info "Installation complete!"
echo
print_warning "Please add the following to your Hyprland configuration:"
echo
echo "# Auto-start wl-gammarelay"
echo "exec-once = wl-gammarelay"
echo "exec-once = sleep 2 && \$HOME/.config/hypr/scripts/smooth-temperature.sh"
echo
echo "# Keyboard shortcuts for manual adjustment"
echo "bind = \$mainMod, Prior, exec, \$HOME/.config/hypr/scripts/temp-up.sh   # Super+PageUp"
echo "bind = \$mainMod, Next, exec, \$HOME/.config/hypr/scripts/temp-down.sh  # Super+PageDown"
echo
print_info "You can customize the temperature settings by editing:"
echo "  - ~/.config/hypr/scripts/smooth-temperature.sh (for smooth transitions)"
echo "  - ~/.config/hypr/scripts/auto-temperature.sh (for simple schedule)"
echo
print_info "Current status:"
systemctl --user status wl-gammarelay-auto.timer --no-pager || true 