Mjolnir Authentication Server
=============================

Abstract
--------

Mjölnir authentication is fully compatible with Yggdrasil authentication which is used by Minecraft and other Mojang apps.
However, Mjölnir is developed for replacing the authentication system of Minecraft in case you want an own authentication server.

Features (planned):

- Own users database
- Backup authentication server (in proxy mode)

In which cases are good such system?

- You are afraid of Microsoft and their future authentication system.
- You have users who do not have premium but you still want to maintain an online server.
- You want to have a backup authentication system.
- ...or just because you can do it. :)


Installation
------------

### Prerequisites

Node.js have to be installed on your system.

#### Installation on Debian based systems (e.g. Ubuntu):

    sudo apt-get install nodejs
    
The command above may not register the command `node` on your system. It is recommended to register it by creating a symlink (otherwise use the command `nodejs` instead `node` in the examples below):

    sudo ln -s nodejs /usr/bin/node
    
#### Installation on Windows

[Download](https://nodejs.org/download/) and install the latest version of Node.js.

### Authentication server

Download the sources, then:

    npm install --production

Generate a new SSL certificate for your server:

    ./generate_ssl.sh
    
*Note that you may have to change the owner of the certification to the same user as node server's!*
    
To start server you have to execute the following command in console:

    NODE_ENV=production node app.js

If you want to use your authentication server, I can recommend using [forever](https://github.com/foreverjs/forever).

#### Installing and configuring Apache proxy

Install Apache2:

    sudo apt-get install apache2
    
Then enable modproxy:

    sudo a2enmod proxy_http

Then add the following lines to your Apache2 config (usually `/etc/apache2/sites-enabled/000-default`):

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

Note: You have to start your Mjolnir server to create the certificate files!
    
#### Selecting encryption algorithm

You can dump the available encryption algorithms by running the server in verbose mode:

    MJOLNIR_VERBOSE=true node app.js
    
### Minecraft clients and servers

You have to create a redirection from the original auth server to your server. You can do this by adding a new line to the hosts file on your machine:

Windows: C:\Windows\System32\drivers\etc\hosts

Linux: /etc/hosts

    <ip-addr-of-your-auth-server>	authserver.mojang.com
    
Note: if you don't know the IP address of the auth server, open a command line and ping the domain: `ping your.domain.com` 
    
Or if the auth server is on the same machine on the Minecraft server/client:

    127.0.0.1 authserver.mojang.com

Then, you have to trust the server's certificate. It is a fake one so this step is necessary.

First, generate the `jssecacerts` file from the server's private key:

Windows:

    generate_cacert.bat

Linux:

    ./generate_cacert.sh
    
Then, you have to copy the newly generated `jssecacerts` file to the following directory:

    <JAVA_HOME>/jre/lib/security

Note: <JAVA_HOME> is usually

* `/usr/lib/jvm/java-*` on linux machines.
* `C:\Program files (x86)\Java` on windows machines.

Note 2: The windows Minecraft launcher may download a different Java version than the installed. You may find this version in the `runtime` folder which should be in the same folder as the `launcher.exe`

Configuration
-------------

There are three configuration files:

* config/default.json: Development mode and default configurations
* config/testing.json: Testing mode, tweaked for automated testing
* config/production.json: Production mode, override the defaults for your server here

Important notes for configuring the Production environment:

* Do not use md5 and other weak password hashing algorithms!
* The secret token must be changed to a randomly generated token!
* The user in the production config serves as an example, remove it before going out in production!

### Creating a user in config

Open the `config/production.json` file using a text editor. Then add the following lines between the brackets, like this:

    "users": [
        {   // a user
          "id": "6c84fb90-12c4-12e1-840d-7b25c5ee775a", // this ID must be a UUID and it must be unique!
          "username": "test",
          "password": "098f6bcd4621d373cade4e832627b4f6", // here is your encrypted password using the algorithm that you've selected
          "playerName": "test"
        },
        {   // a second sample user
          "id": "110ec58a-aaf2-4ac4-8393-c866d813b8d1",
          "username": "test",
          "password": "098f6bcd4621d373cade4e832627b4f6",
          "playerName": "test"
        }
    ]

Utilities
---------

### Password hash generator

You can generate password hashes using the command line interface. Usage (production mode):

    NODE_ENV=production node cli.js create-hash
    
Then type in your password using the interactive console.

Note: You will not see the characters you are typing in!

### UUID generator

You can generate UUID-s for users with the following command:

    node cli.js generate-uuid

Dev Installation
----------------

For testing you will need FrisbyJs and Jasmine as well:

    npm install -g frisby
    npm install -g jasmine-node

Environment variables:

    MJOLNIR_VERBOSE: boolean, set true to verbose mode
    NODE_ENV: environment in which the application should run, the default is development; can be: production, testing

### Running the tests

First, start the server in testing mode:

    NODE_ENV=testing node app.js
    
Then the tests:

    NODE_ENV=testing jasmine-node test
    
Specification
-------------

[Documentation](http://wiki.vg/Authentication)

Roadmap/Changelog
-----------------

Current version: 1.0.0

* 1.0.0: User management with file backend
* 1.1.0: MongoDB backend
* 1.2.0: Transparent (proxy) mode


License
-------

**MIT**
