# Usage guide for authentication server users

For all commands, we will use the Patcher which is a tool for simplifying the configuration tasks.

You can find the patcher in the `patcher/dist` folder.

*Note: it is not possible to use both the original and the private auth server at the same time!
You have to patch your files to use your private server and unpatch/download original jars to use the original servers again.*

## Minecraft server owners

### Patching hosts file

You have to create a redirection from the original auth server to your server. You can do this by patching the hosts file using the patcher (linux):

    java -jar patcher.jar patch-hosts

Or (windows):
    
    patcher.exe patch-hosts
    
**You'll need administrator/root terminal to do that!**

### Trusting SSL certificates

Now, we have to add the authentication server's certificates as a trusted certificate. Run the following command **as root/administrator** (linux):

    java -jar patcher.jar install-certs
    
Or (windows):
        
    patcher.exe install-certs
    
### Downloading a patched server

The last step here is to download a new server jar. In fact, we'll use a Vanilla jar file but with the authentication server's certificate. Linux:

    java -jar patcher.jar patch-server

Windows:

    patcher.exe patch-server

You're done! You can start your server now (with the downloaded jar) and accept client connections. Please note that clients have to patch their system as well!

## Minecraft clients

### Patching hosts file

You have to create a redirection from the original auth server to your server. You can do this by patching the hosts file using the patcher (linux):

    java -jar patcher.jar patch-hosts

Or (windows):
    
    patcher.exe patch-hosts
    
**You'll need administrator/root terminal to do that!**

### Trusting SSL certificates

Now, we have to add the authentication server's certificates as a trusted certificate. Run the following command **as root/administrator** (linux):

    java -jar patcher.jar install-certs
    
Or (windows):
        
    patcher.exe install-certs
    
### Downloading a patched client

As you may expected, you have to patch your client. You can download a freshly patcher launcher by running the following command (linux):

    java -jar patcher.jar patch-launcher

Or (windows):

    patcher.exe patch-launcher

### Patching authlib

Unfortunately, the Minecraft client uses its own library for authentication and not from the launcher. Because of this reason we have to patch that as well. :)

First, start your launcher, login and start Minecraft if you haven't done it yet. It will download the necessary libraries. After entering the menu, you can exit now.

Patch the authlib (linux):

    java -jar patcher.jar patch-authlib

Or (windows):

    patcher.exe patch-authlib
    
Aaaand, you're good to go!
