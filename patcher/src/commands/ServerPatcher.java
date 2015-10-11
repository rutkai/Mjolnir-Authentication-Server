package commands;

import com.google.gson.Gson;
import lib.BasePatcher;
import models.Versions;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/**
 * Downloads and patches the Minecraft Server jar to use a forged certificate
 *
 * @author András Rutkai
 * @since 2015.10.11.
 */
public class ServerPatcher extends BasePatcher {

    private final String VERSIONS_URL = "http://s3.amazonaws.com/Minecraft.Download/versions/versions.json";
    private final String SERVER_JAR_URL = "https://s3.amazonaws.com/Minecraft.Download/versions/%s/minecraft_server.%s.jar";

    private Versions versions;

    public ServerPatcher() throws IOException {
        String json = readInputStream(getDownloadInputStream(VERSIONS_URL));
        Gson gson = new Gson();
        versions = gson.fromJson(json, Versions.class);
    }

    public Versions versions() {
        return versions;
    }

    public void savePatchedLauncher(String version) throws IOException, CertificateException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
        String url = String.format(SERVER_JAR_URL, version, version);
        savePatchedJar(getDownloadInputStream(url), "minecraft_server.jar");
    }

    protected boolean entryWriter(ZipInputStream zis, ZipEntry inEntry, ZipOutputStream zos) throws CertificateException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException, IOException {
        if (inEntry.getName().equalsIgnoreCase("yggdrasil_session_pubkey.der")) {
            ZipEntry entry = new ZipEntry(inEntry.getName());
            byte[] cert = getSessionServerCertificate();
            zos.putNextEntry(entry);
            zos.write(cert, 0, cert.length);
            return true;
        }

        return false;
    }

    private String readInputStream(InputStream stream) throws IOException {
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new InputStreamReader(stream));
            StringBuffer buffer = new StringBuffer();
            int read;
            char[] chars = new char[1024];
            while ((read = reader.read(chars)) != -1) {
                buffer.append(chars, 0, read);
            }

            return buffer.toString();
        } finally {
            if (reader != null) {
                reader.close();
            }
        }
    }

}
