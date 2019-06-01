#!/bin/bash

check_privilege()
{
    if [ "`whoami`" != "root" ]; then
        echo "Require root privilege"
        exit 1
    fi
}

is_noreadonlyfs()
{
    [ -e /proc/cmdline ] || return 0
    grep "\<readonlyfs\>" /proc/cmdline > /dev/null 2>&1 && return 1
    return 0
}

install_python_modules()
{
    apt-get update
    apt-get install -y python3-dev python3-venv
}

initialize_setup_app()
{
    cd /extra/app
    python3 -m venv venv
    ./venv/bin/pip install --upgrade pip
    ./venv/bin/pip install -r requirements.txt
    chown -R $SUDO_USER.$SUDO_USER /extra/app
}

install_gui_packages()
{
    apt-get install -y --no-install-recommends xserver-xorg
    apt-get install -y openbox lightdm accountsservice chromium-browser fonts-noto
}

setup_openbox_for_login_user()
{
    mkdir -p /home/$SUDO_USER/.config/openbox
    cat <<EOF > /home/$SUDO_USER/.config/openbox/autostart
xset -dpms &
xset s off &
chromium-browser --noerrdialogs --kiosk --incognito --disable-translate --fast --fast-start --disable-infobars --disable-features=TranslateUI --disk-cache-dir=/dev/null --no-first-run --no-default-browser-check --disk-cache-size=0 --media-cache-size=0 --disable-bookmark-reordering --disable-extensions --disable-dev-tools --disable-sync http://localhost:8080/ &
EOF
    chown -R $SUDO_USER.$SUDO_USER /home/$SUDO_USER/.config
}

change_lightdm_conf()
{
    sed -i "s/^#xserver-command=X/xserver-command=X -nocursor/" /etc/lightdm/lightdm.conf
}

setup_auto_login()
{
    systemctl set-default graphical.target
    ln -fs /lib/systemd/system/getty@.service /etc/systemd/system/getty.target.wants/getty@tty1.service
    cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf << EOF
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin $SUDO_USER --noclear %I \$TERM
EOF
    sed /etc/lightdm/lightdm.conf -i -e "s/^\(#\|\)autologin-user=.*/autologin-user=$SUDO_USER/"

    # disable_raspi_config_at_boot
    if [ -e /etc/profile.d/raspi-config.sh ]; then
        rm -f /etc/profile.d/raspi-config.sh
        if [ -e /etc/systemd/system/getty@tty1.service.d/raspi-config-override.conf ]; then
            rm /etc/systemd/system/getty@tty1.service.d/raspi-config-override.conf
        fi
        telinit q
    fi
}

register_piadmin_service()
{
    cat <<EOF > /etc/systemd/system/piadmin.service
[Unit]
Description = PiAdmin daemon

[Service]
ExecStart = /extra/app/venv/bin/python app.py
WorkingDirectory = /extra/app
Restart = always
User = $SUDO_USER
Type = simple

[Install]
WantedBy = multi-user.target
EOF
    systemctl enable piadmin.service
    systemctl start piadmin.service
}

is_noreadonlyfs
if ! [ "$?" = 0 ] ; then
    echo "Need to disable readonlyfs"
    exit 1
fi

install_python_modules
initialize_setup_app
install_gui_packages
setup_openbox_for_login_user
change_lightdm_conf
setup_auto_login
register_piadmin_service
