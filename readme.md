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

### Authentication server

Download the sources, then:

    npm install --production

Generate a new SSL certificate for your server:

    ./generate_ssl.sh
    
*Note that you may have to change the owner of the certification to the same user as node server's!*
    
To start server you have to execute the following command in console:

    NODE_ENV=production node index.js

If you want to use your authentication server, I can recommend using [forever](https://github.com/foreverjs/forever).
    
### Minecraft clients and servers

You have to create a redirection from the original auth server to your server. You can do this by adding a new line to the hosts file on your machine:

Windows: C:\Windows\System32\drivers\etc\hosts

Linux: /etc/hosts

    your.server.com	authserver.mojang.com

Then, you have to trust the server's certificate. It is a fake one so this step is necessary.

First, generate the `jssecacerts` file from the server's private key:

Windows:

    generate_cacert.bat

Linux:

    generate_cacert.sh
    
Then, you have to copy the newly generated `jssecacerts` file to the following directory:

    <JAVA_HOME>/jre/lib/security


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

    NODE_ENV=testing node index.js
    
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
