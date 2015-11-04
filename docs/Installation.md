# Installation/Configuration of Mjölnir Authentication Server

## Installation

### Prerequisites

Node.js have to be installed on your system.

[How to install Node.js via package manager](https://nodejs.org/en/download/package-manager/)
    
### Mjolnir Authentication server

Download the sources from github:

    git clone 
 
Then:

    npm install --production

Generate a new SSL certificate for your server:

    ./generate_ssl.sh
    
*Note that you may have to change the owner of the certification to the same user as node server's!*
    
To start the server you have to execute the following command in console:

    NODE_ENV=production node app.js

If you want to use your authentication server as a daemon, I can recommend using [forever](https://github.com/foreverjs/forever).

After this step, your server will be accepting requests but not from the default port (443)! You have to redirect traffic to it depending on the virtual host.

#### Installing and configuring Apache proxy

Install Apache2 on Debian based systems (e.g. Ubuntu):

    sudo apt-get install apache2
    
Then enable modproxy:

    sudo a2enmod proxy_http

And add the following lines to your Apache2 config (usually `/etc/apache2/sites-enabled/000-default`):

    # Authserver
    <VirtualHost *:443>
        ServerName authserver.mojang.com
        
        <Proxy *>
            Order deny,allow
            Allow from all
        </Proxy>
        
        SSLEngine on
        SSLProxyEngine On
        SSLCertificateFile <path-to-mjolnir>/cert/authserver/certificate.crt
        SSLCertificateKeyFile <path-to-mjolnir>/cert/authserver/certificate.key
        
        ProxyRequests off
        ProxyPreserveHost on
        ProxyPass / http://localhost:9000/
        ProxyPassReverse / http://localhost:9000/
    </VirtualHost>
    
    # Sessionserver
    <VirtualHost *:443>
        ServerName sessionserver.mojang.com
        
        <Proxy *>
            Order deny,allow
            Allow from all
        </Proxy>
        
        SSLEngine on
        SSLProxyEngine On
        SSLCertificateFile <path-to-mjolnir>/cert/sessionserver/certificate.crt
        SSLCertificateKeyFile <path-to-mjolnir>/cert/sessionserver/certificate.key
        
        ProxyRequests off
        ProxyPreserveHost on
        ProxyPass / http://localhost:9010/
        ProxyPassReverse / http://localhost:9010/
    </VirtualHost>
    
    # APIserver
    <VirtualHost *:443>
        ServerName api.mojang.com
        
        <Proxy *>
            Order deny,allow
            Allow from all
        </Proxy>
        
        SSLEngine on
        SSLProxyEngine On
        SSLCertificateFile <path-to-mjolnir>/cert/apiserver/certificate.crt
        SSLCertificateKeyFile <path-to-mjolnir>/cert/apiserver/certificate.key
        
        ProxyRequests off
        ProxyPreserveHost on
        ProxyPass / http://localhost:9020/
        ProxyPassReverse / http://localhost:9020/
    </VirtualHost>

*Note: First, you have to start your Mjölnir server to create the certificate files!*

## Configuration

There are three configuration files:

* config/default.json: Development mode and default configurations
* config/testing.json: Testing mode, tweaked for automated testing
* config/production.json: Production mode, **override the defaults for your server here**

**Important notes** for configuring the Production environment:

* Do not use md5 and other weak password hashing algorithms!
* The secret token must be changed to a randomly generated token!
    
### Selecting encryption algorithm

You can set which encryption algorithm do you want to use to store passwords. Passwords are salted by default.

The available encryption algorithms can be dumped by running the server in verbose mode (linux):

    MJOLNIR_VERBOSE=true node app.js
    
Or (windows):

    set MJOLNIR_VERBOSE=true
    node app.js

Then, you can set the selected encryption method to the production config.

### Creating a user in config

Open the `config/production.json` file using a text editor. Then add the following lines between the brackets, like this (but without comments):

    "users": [
        {   // a user
          "id": "6c84fb90-12c4-12e1-840d-7b25c5ee775a", // This ID must be a UUID and it must be unique! See Utilities section.
          "username": "test",
          "password": "098f6bcd4621d373cade4e832627b4f6", // Here is your encrypted password using the algorithm that you've selected. See Utilities section.
          "playerName": "test"
        },
        {   // a second sample user
          "id": "110ec58a-aaf2-4ac4-8393-c866d813b8d1",
          "username": "test2",
          "password": "098f6bcd4621d373cade4e832627b4f6",
          "playerName": "test2"
        }
    ]
    
For UUID and password generation, please see the [Utilities page](Utilities.md).
