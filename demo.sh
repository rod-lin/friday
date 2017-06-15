#! /bin/bash

if [ -z "$1" ]; then
	echo "require 1 argument"
else
	case $1 in
		comm)
			cd ~/Desktop/community && echo -e '\033[00;32m' && less datatable.txt | pv -qL 150
			;;

		numrec)
			cd ~/Desktop/numrec && octave-cli ex3_nn.m
			;;

		2048)
			~/Desktop/fake-2048/2048
			;;		
	esac
fi

