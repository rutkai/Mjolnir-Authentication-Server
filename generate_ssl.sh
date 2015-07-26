#!/bin/bash

openssl genrsa -out cert/authserver/server.key 2048
openssl rsa -in cert/authserver/server.key -pubout > cert/authserver/server.pub
openssl genrsa -out cert/sessionserver/server.key 2048
openssl rsa -in cert/sessionserver/server.key -pubout > cert/sessionserver/server.pub

echo -e " The Certificates and Keys have been generated!"
cd ..
