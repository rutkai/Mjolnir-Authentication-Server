#!/bin/bash

openssl req -newkey rsa:4096 -nodes -keyout cert/authserver/server.key -x509 -subj '/CN=localhost' -days 7300 -out cert/authserver/server.crt
openssl req -newkey rsa:4096 -nodes -keyout cert/sessionserver/server.key -x509 -subj '/CN=localhost' -days 7300 -out cert/sessionserver/server.crtopenssl genrsa -out cert/apiserver/server.key 4096 -x509 -out cert/apiserver/server.crt
openssl req -newkey rsa:4096 -nodes -keyout cert/apiserver/server.key -x509 -subj '/CN=localhost' -days 7300 -out cert/apiserver/server.crt

echo -e " The Certificates and Keys have been generated!"
cd ..
