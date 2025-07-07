##install script for StuartW-Source KDE-Plasma6 Dotfiles##

#install base-devel which is required for AUR managment
sudo pacman -S --needed base-devel

#install git
sudo pacman -S --noconfirm git

#download and install paru community repo manager
git clone https://aur.archlinux.org/paru.git
cd ~/paru
makepkg -si

#application installs
sudo pacman -Syu fastfetch ghostty opera spotify guitarix --noconfirm

#enable bluetooth to start on startup
sudo bluetoothctl enable

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








sudo reboot
