#!/bin/sh

# Downloading public key
openssl s_client -connect sessionserver.mojang.com:443 -showcerts </dev/null | openssl x509 -outform der > yggdrasil_session_pubkey.der

# Saving it in the launcher archive
if [ -f "launcher.jar" ]; then
	echo "Patching launcher..."
	
	echo "Done"
	exit
fi

echo "Please enter the path of launcher.jar: "
read DIR

if [ -f "$DIR/launcher.jar" ]; then
	DIR=$DIR/launcher.jar
fi

if [ -f "$DIR" ]; then
	echo "Patching launcher..."
	
	echo "Done"
	exit
fi

echo "Could not find launcher.jar!"

