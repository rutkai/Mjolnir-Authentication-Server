#!/bin/bash

openssl genrsa -out cert/authserver/server.key 4096
openssl genrsa -out cert/sessionserver/server.key 4096

echo -e " The Certificates and Keys have been generated!"
cd ..
