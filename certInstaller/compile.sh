#!/bin/sh

javac InstallCert.java
jar cfe InstallCert.jar InstallCert InstallCert\$SavingTrustManager.class InstallCert.class
rm *.class

