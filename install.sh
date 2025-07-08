##install script for StuartW-Source KDE-Plasma6 Dotfiles##


#!/bin/bash
set -e

# Enable dry-run with --dry-run
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🧪 Dry run mode enabled. No changes will be made."
fi
VERBOSE=false
for arg in "$@"; do
  [[ "$arg" == "--verbose" ]] && VERBOSE=true
done

#Read packages function
read_packages() {
  local file="$1"
  if [[ -f "$file" ]]; then
    tr '\n' ' ' < "$file"
  else
    echo "❌ Error: $file not found" >&2
    exit 1
  fi
}

#package list
app=$(read_packages "applications.txt")

#install packages
for pkg in $req; do
  if pacman -Qq "$app" &>/dev/null; then
    echo "✅ $app is already installed, skipping."
  else
    run_cmd "paru -S --noconfirm $app"
  fi
done

#download and install paru community repo manager
git clone https://aur.archlinux.org/paru.git
cd ~/paru
makepkg -si --noconfirm

#install git
echo "installing git and updating system"
sudo pacman -Syu --noconfirm git

#enable bluetooth to start on startup
echo "enabling bluetooth on startup"
run_cmd "sudo bluetoothctl start"
run_cmd "sudo bluetoothctl enable bluetooth"

#install base-devel which is required for AUR managment
sudo pacman -S --needed base-devel

#wallpaper copy
cp ~/KDEPLAMSA6-DOTFILES/wallpaper/Goku_1.jpeg ~/pictures/wallpaper/
cp ~/KDEPLAMSA6-DOTFILES/wallpaper/Vegeta_1.jpeg ~/pictures/wallpaper/

#fastfetch config copy
cp ~/KDEPLAMSA6-DOTFILES/Applications/fastfetch/cat.png ~/.config/fastfetch/
cp ~/KDEPLAMSA6-DOTFILES/Applications/fastfetch/config.jsonc ~/.config/fastfetch/

#ghostty config copy
cp ~/KDEPLAMSA6-DOTFILES/Applications/ghostty/config ~/.config/ghostty/

#starship config copy
cp ~/KDEPLASMA6-DOTFILES/starship/starship.toml ~/.config/

#KDE desktop set up copy
cp ~/KDEPLASMA6-DOTFILES/KDE-desktop/plasma-org.kde.plasma.desktop-appletsrc ~/.config/
cp ~/KDEPLASMA6-DOTFILES/KDE-desktop/plasmashellrc ~/.config/
cp ~/KDEPLASMA6-DOTFILES/KDE-desktop/plasmoids ~/.local/share/plasma

#install nvidia drivers
sudo pacman -S nvidia-open nvidia-utils

#copy bashrc config file
cp ~/KDEPLASMA6-DOTFILES/Applications/bashrc/.bashrc ~/



sudo reboot
