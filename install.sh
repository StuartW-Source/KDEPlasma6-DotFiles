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
FLATPAK_LIST="flatpaks.txt"

#install packages
for app in $app; do
  if pacman -Qq "$app" &>/dev/null; then
    echo " $app is already installed, skipping."
  else
    run_cmd "paru -S --noconfirm $app"
  fi
done

# Remote to install from (default is flathub)
REMOTE="flathub"

# Check if flatpaks.txt exists
if [[ ! -f "$FLATPAK_LIST" ]]; then
    echo "Error: $FLATPAK_LIST not found!"
    exit 1
fi

# Read each line in the file
while IFS= read -r app_id || [[ -n "$app_id" ]]; do
    # Skip empty lines or lines starting with #
    [[ -z "$app_id" || "$app_id" =~ ^# ]] && continue

    # Check if the app is already installed
    if flatpak list --app --columns=application | grep -qx "$app_id"; then
        echo "✅ $app_id is already installed."
    else
        echo "📦 Installing $app_id..."
        run_cmd "flatpak install -y "$REMOTE" "$app_id""
    fi
done < "$FLATPAK_LIST"

#Configs copy#



####Wallpaper Copy###

echo "copying configuration files"

copy_config() {
  local name="$1"
  local src="$2"
  local dest="$3"
  local is_dir="$4"

  echo "📁 Processing $name"

  if [[ "$is_dir" == "dir" && ! -d "$src" ]]; then
    echo "❌ $name - Source directory does not exist: $src"
    return 1
  elif [[ "$is_dir" == "file" && ! -f "$src" ]]; then
    echo "❌ $name - Source file does not exist: $src"
    return 1
  fi

  run_cmd "mkdir -p \"$(dirname \"$dest\")\""

  if [[ "$is_dir" == "dir" ]]; then
    run_cmd "mkdir -p \"$dest\""
    run_cmd "cp -r \"$src\"/. \"$dest\"/"
  else
    run_cmd "cp \"$src\" \"$dest\""
  fi

  if $VERIFY; then
    verify_copy "$src" "$dest" "$name"
  else
    echo "🔍 Verification skipped for $name."
  fi
}

verify_copy() {
  local src="$1"
  local dest="$2"
  local label="$3"

  if $DRY_RUN; then
    echo "ℹ️  Skipping verification for $label due to dry run mode."
    return 0
  fi

  echo "🔍 Verifying copied files for $label..."

  if [[ -d "$src" ]]; then
    if diff -r "$src" "$dest" > /dev/null; then
      echo "✅ $label - Directory copy verified."
    else
      echo "⚠️ $label - Directory differs between $src and $dest."
    fi
  else
    local src_hash dest_hash
    src_hash=$(sha256sum "$src" | awk '{print $1}')
    dest_hash=$(sha256sum "$dest" | awk '{print $1}')
    if [[ "$src_hash" == "$dest_hash" ]]; then
      echo "✅ $label - File copy verified."
    else
      echo "⚠️ $label - File copy content mismatch!"
    fi
  fi
}

# Run copy and config call
copy_config "Wallpaper" "$HOME/KDEPlasma6-DotFiles/wallpaper" "$HOME/Pictures/wallpaper" "dir"
copy_config "Fastfetch" "$HOME/KDEPlasma6-DotFiles/Applications/fastfetch/" "$HOME/.config/fastfetch" "dir"
copy_config "Ghostty" "$HOME/KDEPlasma6-DotFiles/Applications/ghostty/config" "$HOME/.config/ghostty/config" "file"
copy_config "Starship" "$HOME/KDEPlasma6-DotFiles/starship/starship.toml" "$HOME/.config/starship.toml" "file"
copy_config "KDE Desktop" "$HOME/KDEPlasma6-DotFiles/KDE-desktop/" "$HOME/.config/" "dir"
copy_config "Plasmoids" "$HOME/KDEPlasma6-DotFiles/plasmoids" "$HOME/.local/share/plasma/plasmoids" "dir"
copy_config "Bashrc" "$HOME/KDEPlasma6-DotFiles/Applications/bashrc/.bashrc" "$HOME/.bashrc" "file"

echo "Setup complete. Reboot required"
read -rp "Reboot now? [y/N]: " reboot_now
if [[ "$reboot_now" =~ ^[Yy]$ ]]; then
    run_cmd "reboot"
else
    echo "Reboot skipped. Please reboot manually to apply all changes."
fi