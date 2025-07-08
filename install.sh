##install script for StuartW-Source KDE-Plasma6 Dotfiles##

#install base-devel which is required for AUR managment
run_cmd "sudo pacman -S --needed base-devel"

#install git
run_cmd "sudo pacman -S --noconfirm git"

#download and install paru community repo manager
run_cmd "git clone https://aur.archlinux.org/paru.git"
run_cmd "cd ~/paru"
run_cmd "makepkg -si --noconfirm"

#application installs
run_cmd "sudo pacman -Syu fastfetch ghostty opera spotify guitarix visual-studio-code-bin ttf-jetbrains-mono-nerd --noconfirm"

#enable bluetooth to start on startup
run_cmd "sudo bluetoothctl enable bluetooth"

#wallpaper copy
run_cmd "cp ~/KDEPLAMSA6-DOTFILES/wallpaper/Goku_1.jpeg ~/pictures/wallpaper/"
run_cmd "cp ~/KDEPLAMSA6-DOTFILES/wallpaper/Vegeta_1.jpeg ~/pictures/wallpaper/"

#fastfetch config copy
run_cmd "cp ~/KDEPLAMSA6-DOTFILES/Applications/fastfetch/cat.png ~/.config/fastfetch/"
run_cmd "cp ~/KDEPLAMSA6-DOTFILES/Applications/fastfetch/config.jsonc ~/.config/fastfetch/"

#ghostty config copy
run_cmd "cp ~/KDEPLAMSA6-DOTFILES/Applications/ghostty/config ~/.config/ghostty/"

#starship config copy
run_cmd "cp ~/KDEPLASMA6-DOTFILES/starship/starship.toml ~/.config/"

#KDE desktop set up copy
run_cmd "cp ~/KDEPLASMA6-DOTFILES/KDE-desktop/plasma-org.kde.plasma.desktop-appletsrc ~/.config/"
run_cmd "cp ~/KDEPLASMA6-DOTFILES/KDE-desktop/plasmashellrc ~/.config/"
run_cmd "cp ~/KDEPLASMA6-DOTFILES/KDE-desktop/plasmoids ~/.local/share/plasma"

#install nvidia drivers
run_cmd "sudo pacman -S nvidia-open nvidia-utils"






sudo reboot
