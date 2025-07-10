#!/bin/bash
set -e

# Enable dry run mode with --dry-run
DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🧪 Dry run mode enabled. No changes will be made."
fi
VERBOSE=false
for arg in "$@"; do
  [[ "$arg" == "--verbose" ]] && VERBOSE=true
done
# Helper to run or simulate commands
run_cmd() {
  if $DRY_RUN; then
    echo "[DRY RUN] $*"
  else
    if $VERBOSE; then
      echo "[VERBOSE] $*"
      bash -c "$@"
    else
      bash -c "$@" > /dev/null 2>&1 &
      pid=$!
      while kill -0 $pid 2>/dev/null; do
        echo -n "."
        sleep 0.7
      done
      wait $pid
      echo " done"
    fi
  fi
}

#install base-devel which is required for AUR managment
run_cmd "sudo pacman -S --needed base-devel"

#install nvidia drivers
echo "installing nvidia drivers"
run_cmd "sudo pacman -S nvidia-open nvidia-utils"

#enable bluetooth to start on startup
echo "enabling bluetooth on startup"
run_cmd "sudo systemctl enable bluetooth"

#Read packages function
read_packages() {
  local file="$1"
  if [[ -f "$file" ]]; then
    tr '\n' ' ' < "$file"
  else
    echo " Error: $file not found" >&2
    exit 1
  fi
}

echo "📦 Installing git and paru..."
run_cmd "sudo pacman -Syu --noconfirm git"

if [[ ! -d "paru" ]]; then
  run_cmd "git clone https://aur.archlinux.org/paru.git"
fi

if [[ -d "paru" ]]; then
  cd paru || exit
  run_cmd "makepkg -si --noconfirm"
  cd ..
fi

echo "✅ Paru installed."

#package list
app=$(read_packages "applications.txt")

#install packages
for app in $app; do
  if pacman -Qq "$app" &>/dev/null; then
    echo " $app is already installed, skipping."
  else
    run_cmd "paru -S --noconfirm $app"
  fi
done

#wallpaper copy
echo "copying configuration files"
run_cmd "cp ~/KDEPLAMSA6-DOTFILES/wallpaper/ ~/pictures/wallpaper/"
run_cmd "cp ~/KDEPLAMSA6-DOTFILES/wallpaper/ ~/pictures/wallpaper/"

#fastfetch config copy
run_cmd "cp ~/KDEPLAMSA6-DOTFILES/Applications/fastfetch/cat.png ~/.config/fastfetch/"
run_cmd "cp ~/KDEPLAMSA6-DOTFILES/Applications/fastfetch/config.jsonc ~/.config/fastfetch/"

#ghostty config copy
run_cmd "cp ~/KDEPLAMSA6-DOTFILES/Applications/ghostty/config ~/.config/ghostty/config"

#starship config copy
run_cmd "cp ~/KDEPLASMA6-DOTFILES/starship/starship.toml ~/.config/starship.toml"

#KDE desktop set up copy
run_cmd "cp ~/KDEPLASMA6-DOTFILES/KDE-desktop/plasma-org.kde.plasma.desktop-appletsrc ~/.config/"
run_cmd "cp ~/KDEPLASMA6-DOTFILES/KDE-desktop/plasmashellrc ~/.config/"
run_cmd "cp ~/KDEPLASMA6-DOTFILES/KDE-desktop/plasmoids ~/.local/share/plasma"

#copy bashrc config file
run_cmd "cp ~/KDEPLASMA6-DOTFILES/Applications/bashrc/.bashrc ~/.bashrc"

echo "Setup complete. Reboot required"
read -rp "Reboot now? [y/N]: " reboot_now
if [[ "$reboot_now" =~ ^[Yy]$ ]]; then
    run_cmd "reboot"
else
    echo "Reboot skipped. Please reboot manually to apply all changes."
fi