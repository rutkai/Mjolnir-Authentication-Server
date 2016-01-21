Mjölnir Authentication Server
=============================

Abstract
--------

Mjölnir authentication is fully compatible with Yggdrasil authentication which is used by Minecraft and other Mojang apps.
However, Mjölnir is developed for replacing the authentication system of Minecraft in case you want an own authentication server.

Features (planned):

- Own users database
- Backup authentication server (in proxy mode)
- Rate limit

In which cases are good such a system?

- You have users who do not have premium but you still want to maintain an online server.
- You want to have a backup authentication system.
- ...or just because you can do it. :)


Usage (clients/servers)
------------------------------

See [Usage guide](docs/Usage.md).

Installation/Usage (Mjölnir)
----------------------

See [Installation guide](docs/Installation.md).

Utilities
---------

See [Utilities page](docs/Utilities.md).

Dev Installation
----------------

See [Contribution guide](CONTRIBUTION.md) for dev installation.
    
Specification
-------------

[Documentation](http://wiki.vg/Authentication)

Roadmap/Changelog
-----------------

* 1.0.0: User management with file backend
* 1.1.0: MongoDB backend
* 1.2.0: Transparent (proxy) mode

License
-------

**MIT**
