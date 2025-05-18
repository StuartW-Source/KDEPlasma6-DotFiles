##install script for StuartW-Source KDE-Plasma6 Dotfiles##

sudo pacman -S --needed base-devel

sudo pacman -S --noconfirm git

git clone https://aur.archlinux.org/paru.git
cd ~/paru
makepkg -si

sudo pacman -Syu fastfetch ghostty opera spotify guitarix --noconfirm

cd ~/KDEPLASMA6-DOTTTFILES

cp -R com.github.prayag2.modernclock -t ~/.local/share/plasma/plasmoids/
cp -R org.kde.latte.spacer -t ~/.local/share/plasma/plasmoids/
cp -R org.kde.plasma.plasm6desktopindicator -t ~/.local/share/plasma/plasmoids/

