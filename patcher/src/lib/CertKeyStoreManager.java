package lib;

import java.io.*;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;

public class CertKeyStoreManager {

    private final char[] PASSPHRASE = "changeit".toCharArray();

    private KeyStore keyStore;

    public CertKeyStoreManager() throws KeyStoreException, IOException, NoSuchAlgorithmException, CertificateException {
        keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
        InputStream in = new FileInputStream(getCacertsFile());
        keyStore.load(in, PASSPHRASE);
        in.close();
    }

    public KeyStore getKeyStore() {
        return keyStore;
    }

    public void writeKeyStore() throws KeyStoreException, IOException, NoSuchAlgorithmException, CertificateException {
        OutputStream out = new FileOutputStream(getSecurityPath() + File.separatorChar + "jssecacerts");
        keyStore.store(out, PASSPHRASE);
        out.close();
    }

    private File getCacertsFile() {
        File file = new File("jssecacerts");
        if (!file.isFile()) {
            File dir = new File(getSecurityPath());
            file = new File(dir, "jssecacerts");
            if (!file.isFile()) {
                file = new File(dir, "cacerts");
            }
        }
        return file;
    }

    private String getSecurityPath() {
        return System.getProperty("java.home") + File.separatorChar
                + "lib" + File.separatorChar + "security";
    }

}
