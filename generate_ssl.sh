#!/bin/bash
cd cert

openssl genrsa -out cert/server.key 2048
openssl rsa -in server.key -pubout > server.pub

echo -e " The Certificate and Key has been generated!"
cd ..