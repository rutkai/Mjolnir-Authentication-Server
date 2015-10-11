package commands;

import SevenZip.Compression.LZMA.Decoder;
import lib.CertKeyStoreManager;

import javax.xml.bind.DatatypeConverter;
import java.io.*;
import java.net.URL;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.util.Scanner;
import java.util.jar.JarOutputStream;
import java.util.jar.Pack200;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/**
 * Downloads and patches the Minecraft Launcher to use a forged certificate
 *
 * @author András Rutkai
 * @since 2015.10.03.
 */
public class LauncherPatcher {

    private final String DOWNLOAD_URL = "https://s3.amazonaws.com/Minecraft.Download/launcher/launcher.pack.lzma";
    private final String ORIGINAL_CERT_CHECKSUM = "Sj8xWBxbm84OU915qY0tpT+l4RbDoWw8NtuZHxUrJVQ=";

    public void savePatchedLauncher() throws CertificateException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException, IOException {
        ZipInputStream zis = getZipStream();
        byte[] cert = getSessionServerCertificate();

        File f = new File("launcher.jar");
        ZipOutputStream zos = new ZipOutputStream(new FileOutputStream(f));

        ZipEntry inEntry;
        while ((inEntry = zis.getNextEntry()) != null) {
            if (inEntry.getName().equalsIgnoreCase("yggdrasil_session_pubkey.der")) {
                ZipEntry entry = new ZipEntry("yggdrasil_session_pubkey.der");
                zos.putNextEntry(entry);
                zos.write(cert, 0, cert.length);
            } else if (inEntry.getName().equalsIgnoreCase("META-INF/MANIFEST.MF")) {
                Scanner scanner = new Scanner(zis).useDelimiter("\\A");
                String manifest = scanner.hasNext() ? scanner.next() : "";
                manifest = manifest.replaceAll("(?s)" + Pattern.quote(ORIGINAL_CERT_CHECKSUM), sha256Digest(cert));

                ZipEntry entry = new ZipEntry("META-INF/MANIFEST.MF");
                zos.putNextEntry(entry);
                zos.write(manifest.getBytes(), 0, manifest.length());
            } else {
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

    private byte[] getSessionServerCertificate() throws CertificateException, NoSuchAlgorithmException, KeyStoreException, IOException, KeyManagementException {
        CertKeyStoreManager keyStoreManager = new CertKeyStoreManager();
        CertManager cm = new CertManager(keyStoreManager);

        return cm.getCert("sessionserver.mojang.com").getEncoded();
    }

    private String sha256Digest(byte[] file) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(file);
        return DatatypeConverter.printBase64Binary(md.digest());
    }

    private ZipInputStream getZipStream() throws IOException {
        InputStream archiveStream = downloadLzmaArchive();
        InputStream packStream = unzip(archiveStream);
        InputStream jar = unpackJar(packStream);
        return new ZipInputStream(jar);
    }

    private InputStream downloadLzmaArchive() throws IOException {
        URL website = new URL(DOWNLOAD_URL);
        return website.openStream();
    }

    private InputStream unzip(InputStream unbufferedInputStream) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        BufferedInputStream bufferedInputStream = new BufferedInputStream(unbufferedInputStream);
        BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(outputStream);
        Decoder decoder = new Decoder();

        int propertiesSize = 5;
        byte[] properties = new byte[propertiesSize];
        if (bufferedInputStream.read(properties, 0, propertiesSize) != propertiesSize) {
            throw new IOException("input .lzma file is too short");
        }
        if (!decoder.SetDecoderProperties(properties)) {
            throw new IOException("Incorrect stream properties");
        }

        long outSize = 0L;
        for (int i = 0; i < 8; ++i) {
            int size = bufferedInputStream.read();
            if (size < 0) {
                throw new IOException("Can't read stream size");
            }

            outSize |= (long) size << (8 * i);
        }

        decoder.Code(bufferedInputStream, bufferedOutputStream, outSize);
        bufferedInputStream.close();
        bufferedOutputStream.flush();

        return new ByteArrayInputStream(outputStream.toByteArray());
    }

    private InputStream unpackJar(InputStream inputStream) throws IOException {
        Pack200.Unpacker unpacker = Pack200.newUnpacker();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        JarOutputStream jos = new JarOutputStream(outputStream);
        unpacker.unpack(inputStream, jos);
        jos.flush();
        jos.finish();
        inputStream.close();
        return new ByteArrayInputStream(outputStream.toByteArray());
    }

}
