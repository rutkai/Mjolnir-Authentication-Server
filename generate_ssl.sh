#!/bin/bash

openssl req -newkey rsa:4096 -nodes -keyout cert/authserver/certificate.key -x509 -subj '/CN=localhost' -days 7300 -out cert/authserver/certificate.crt
openssl req -newkey rsa:4096 -nodes -keyout cert/sessionserver/certificate.key -x509 -subj '/CN=localhost' -days 7300 -out cert/sessionserver/certificate.crt
openssl req -newkey rsa:4096 -nodes -keyout cert/apiserver/certificate.key -x509 -subj '/CN=localhost' -days 7300 -out cert/apiserver/certificate.crt

echo -e " The Certificates and Keys have been generated!"
cd ..
