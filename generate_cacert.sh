#!/bin/bash

# Creating cacert file
java -jar certInstaller/InstallCert.jar authserver.mojang.com:443
mv jssecacerts authcert
java -jar certInstaller/InstallCert.jar sessionserver.mojang.com:443
keytool -importkeystore -noprompt -srckeystore authcert -destkeystore jssecacerts -srcstorepass changeit -deststorepass changeit
rm authcert
echo "jssecacerts has been created!"

# Moving it to the desired directory
DEST=`java -jar certInstaller/InstallCert.jar SecurityPath`
mv jssecacerts $DEST
if [ $? = 0 ]; then
	echo "jssecacerts has been installed!"
fi
