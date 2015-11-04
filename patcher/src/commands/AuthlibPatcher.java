package commands;

import lib.BasePatcher;
import lib.VersionComparator;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public class AuthlibPatcher extends BasePatcher {

    public void patch() throws IOException, CertificateException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
        String authlibJar = getAuthlibJarPath();
        patchJar(authlibJar);
        generateChecksum(authlibJar);
    }

    private void patchJar(String authlibJar) throws IOException, CertificateException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException {
        FileInputStream in = new FileInputStream(authlibJar);
        savePatchedJar(in, authlibJar + ".new");
        Files.move(Paths.get(authlibJar + ".new"), Paths.get(authlibJar), StandardCopyOption.REPLACE_EXISTING);
    }

    private void generateChecksum(String authlibJar) throws IOException, NoSuchAlgorithmException {
        byte[] rawChecksum = createSha1(new File(authlibJar));
        String checksum = bytesToHex(rawChecksum);
        writeChecksum(authlibJar, checksum);
    }

    private String getHome() {
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            return System.getProperty("user.home") + "\\.minecraft";
        }

        // On OSX: ~/Library/Application Support/minecraft

        return System.getProperty("user.home") + "/.minecraft";
    }

    private String getAuthlibFolder() {
        return getHome() + File.separatorChar + "libraries" + File.separatorChar + "com" + File.separatorChar + "mojang" + File.separatorChar + "authlib";
    }

    private String getLatestVersion() {
        ArrayList<String> names = new ArrayList<>();

        File folder = new File(getAuthlibFolder());
        for (File entry : folder.listFiles()) {
            if (entry.isDirectory() && entry.getName().matches("[0-9]+\\.[0-9]+\\.[0-9]+")) {
                names.add(entry.getName());
            }
        }

        Collections.sort(names, new VersionComparator());

        return names.get(names.size() - 1);
    }

    private String getAuthlibJarPath() {
        String version = getLatestVersion();
        return getAuthlibFolder() + File.separatorChar + version + File.separatorChar + "authlib-" + version + ".jar";
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

    private byte[] createSha1(File file) throws IOException, NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-1");
        FileInputStream fis = new FileInputStream(file);
        int n = 0;
        byte[] buffer = new byte[8192];
        while (n != -1) {
            n = fis.read(buffer);
            if (n > 0) {
                digest.update(buffer, 0, n);
            }
        }
        return digest.digest();
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte byt : bytes) {
            result.append(Integer.toString((byt & 0xff) + 0x100, 16).substring(1));
        }
        return result.toString();
    }

    private void writeChecksum(String authlibJar, String checksum) throws FileNotFoundException {
        PrintWriter file = new PrintWriter(authlibJar + ".sha");
        file.print(checksum);
        file.close();
    }

}
