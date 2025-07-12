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

# Install base-devel (required for AUR)
echo "📦 Checking base-devel..."
if pacman -Qq base-devel &>/dev/null; then
  echo "✅ base-devel is already installed."
else
  echo "📦 Installing base-devel..."
  run_cmd "sudo pacman -S --needed base-devel"
fi

# Install NVIDIA drivers
echo "📦 Checking NVIDIA drivers..."
nvidia_packages=(nvidia-open nvidia-utils)
nvidia_missing=false

for pkg in "${nvidia_packages[@]}"; do
  if ! pacman -Qq "$pkg" &>/dev/null; then
    nvidia_missing=true
    break
  fi
done

if $nvidia_missing; then
  echo "📦 Installing NVIDIA drivers..."
  run_cmd "sudo pacman -S --needed ${nvidia_packages[*]}"
else
  echo "✅ NVIDIA drivers are already installed."
fi

# Enable Bluetooth on startup
echo "🔧 Checking Bluetooth service..."
if systemctl is-enabled bluetooth &>/dev/null; then
  echo "✅ Bluetooth service already enabled."
else
  echo "🔧 Enabling Bluetooth on startup..."
  run_cmd "sudo systemctl enable bluetooth"
fi

# Read packages function
read_packages() {
  local file="$1"
  if [[ -f "$file" ]]; then
    tr '\n' ' ' < "$file"
  else
    echo "Error: $file not found" >&2
    exit 1
  fi
}

# Install git and paru
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

# Install packages from applications.txt
app_list=$(read_packages "applications.txt")
for app in $app_list; do
  if pacman -Qq "$app" &>/dev/null; then
    echo "✅ $app is already installed."
  else
    run_cmd "paru -S --noconfirm $app"
  fi
done

# Install Flatpaks from flatpaks.txt
FLATPAK_LIST="flatpaks.txt"
REMOTE="flathub"

if [[ ! -f "$FLATPAK_LIST" ]]; then
  echo "Error: $FLATPAK_LIST not found!"
  exit 1
fi

while IFS= read -r app_id || [[ -n "$app_id" ]]; do
  [[ -z "$app_id" || "$app_id" =~ ^# ]] && continue
  if flatpak list --app --columns=application | grep -qx "$app_id"; then
    echo "✅ $app_id is already installed."
  else
    echo "📦 Installing $app_id..."
    run_cmd "flatpak install -y $REMOTE $app_id"
  fi
done < "$FLATPAK_LIST"

# Copy and verify configs
echo "🔧 Copying configuration files..."

copy_config() {
  local name="$1"
  local src="$2"
  local dest="$3"
  local is_dir="$4"

  echo "📁 Processing $name"

  if [[ "$is_dir" == "dir" && ! -d "$src" ]]; then
    echo "❌ $name - Source directory does not exist: $src"
    return
  elif [[ "$is_dir" == "file" && ! -f "$src" ]]; then
    echo "❌ $name - Source file does not exist: $src"
    return
  fi

  run_cmd "mkdir -p \"$(dirname "$dest")\""

  if [[ "$is_dir" == "dir" ]]; then
    run_cmd "mkdir -p \"$dest\""
    run_cmd "cp -r \"$src\"/. \"$dest\"/"
  else
    run_cmd "cp \"$src\" \"$dest\""
  fi

  if [[ "$VERIFY" == true ]]; then
    verify_copy "$src" "$dest" "$name" || true
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

  src="${src%/}" # Normalize path
  echo "🔍 Verifying copied files for $label..."
  local errors=0

  if [[ -d "$src" ]]; then
    while IFS= read -r -d '' file; do
      local relpath="${file#$src/}"
      local destfile="$dest/$relpath"
      if [[ ! -e "$destfile" ]]; then
        echo "⚠️ $label - Missing file in destination: $relpath"
        ((errors++))
        continue
      fi
      if [[ -f "$file" ]]; then
        local src_hash dest_hash
        src_hash=$(sha256sum "$file" | awk '{print $1}')
        dest_hash=$(sha256sum "$destfile" | awk '{print $1}')
        if [[ "$src_hash" != "$dest_hash" ]]; then
          echo "⚠️ $label - File content mismatch: $relpath"
          ((errors++))
        fi
      fi
    done < <(find "$src" -type f -print0)

    if (( errors == 0 )); then
      echo "✅ $label - Directory copy verified."
    else
      echo "⚠️ $label - Verification failed with $errors mismatches."
      return 1
    fi
  else
    local src_hash dest_hash
    src_hash=$(sha256sum "$src" | awk '{print $1}')
    dest_hash=$(sha256sum "$dest" | awk '{print $1}')
    if [[ "$src_hash" == "$dest_hash" ]]; then
      echo "✅ $label - File copy verified."
    else
      echo "⚠️ $label - File copy content mismatch!"
      return 1
    fi
  fi
}

# Enable verification - skip verification with --no-verify flag
VERIFY=true

# Run your copy_config tasks
copy_config "Wallpaper" "$HOME/KDEPlasma6-DotFiles/wallpaper" "$HOME/Pictures/wallpaper" "dir"
copy_config "Fastfetch" "$HOME/KDEPlasma6-DotFiles/Applications/fastfetch" "$HOME/.config/fastfetch" "dir"
copy_config "Ghostty" "$HOME/KDEPlasma6-DotFiles/Applications/ghostty/config" "$HOME/.config/ghostty/config" "file"
copy_config "Starship" "$HOME/KDEPlasma6-DotFiles/starship/starship.toml" "$HOME/.config/starship.toml" "file"
copy_config "KDE Desktop" "$HOME/KDEPlasma6-DotFiles/KDE-desktop" "$HOME/.config/" "dir"
copy_config "Plasmoids" "$HOME/KDEPlasma6-DotFiles/plasmoids" "$HOME/.local/share/plasma/plasmoids" "dir"
copy_config "Bashrc" "$HOME/KDEPlasma6-DotFiles/Applications/bashrc/.bashrc" "$HOME/.bashrc" "file"

echo "✅ Setup complete. Reboot required."
read -rp "Reboot now? [y/N]: " reboot_now
if [[ "$reboot_now" =~ ^[Yy]$ ]]; then
  run_cmd "reboot"
else
  echo "Reboot skipped. Please reboot manually to apply all changes."
fi
