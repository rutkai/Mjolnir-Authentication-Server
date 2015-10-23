package lib;

import commands.CertManager;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/**
 * Common functions in *Patcher classes
 */
public abstract class BasePatcher {

    private byte[] sessionserverCertification;

    abstract protected boolean entryWriter(ZipInputStream zis, ZipEntry inEntry, ZipOutputStream zos) throws CertificateException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException, IOException;

    protected void savePatchedJar(InputStream jar, String outputName) throws IOException, CertificateException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
        ZipInputStream zis = new ZipInputStream(jar);

        File f = new File(outputName);
        ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(f));

        ZipEntry inEntry;
        while ((inEntry = zis.getNextEntry()) != null) {
            if (!entryWriter(zis, inEntry, zos)) {
                zos.putNextEntry(inEntry);
                byte[] buffer = new byte[1024];
                int len;
                while ((len = (zis.read(buffer))) > 0) {
                    zos.write(buffer, 0, len);
                }
            }

            zos.closeEntry();
        }

        zos.close();
    }

    protected InputStream getDownloadInputStream(String url) throws IOException {
        URL website = new URL(url);
        return website.openStream();
    }

    protected byte[] getSessionServerCertificate() throws CertificateException, NoSuchAlgorithmException, KeyStoreException, IOException, KeyManagementException {
        if (sessionserverCertification != null) {
            return sessionserverCertification;
        }

        CertKeyStoreManager keyStoreManager = new CertKeyStoreManager();
        CertManager cm = new CertManager(keyStoreManager);
        sessionserverCertification = cm.getKey("sessionserver.mojang.com").getEncoded();

        return sessionserverCertification;
    }

}
