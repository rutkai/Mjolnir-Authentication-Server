#!/bin/bash

java -jar certInstaller/InstallCert.jar authserver.mojang.com:443
mv jssecacerts authcert
java -jar certInstaller/InstallCert.jar sessionserver.mojang.com:443
keytool -importkeystore -noprompt -srckeystore authcert -destkeystore jssecacerts -srcstorepass changeit -deststorepass changeit
rm authcert
echo "jssecacerts has been created!"
