package commands;

import lib.CertKeyStoreManager;

/**
 * Installs two new jssecerts which are required by Minecraft
 *
 * @author András Rutkai
 * @since 2015.10.03.
 */
public class CertInstaller {

    public void installCerts() throws Exception {
        CertKeyStoreManager keyStoreManager = new CertKeyStoreManager();
        CertManager cm = new CertManager(keyStoreManager);

        cm.installCert("authserver.mojang.com");
        cm.installCert("sessionserver.mojang.com");

        keyStoreManager.writeKeyStore();
    }

}
