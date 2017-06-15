#! /bin/bash

if [ $1 = "auto" ]; then
	xrandr --output LVDS-1 --auto
else
	xrandr --output LVDS-1 --mode $1
fi

xrandr --output VGA-1 --same-as LVDS-1

