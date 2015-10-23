package commands;

import SevenZip.Compression.LZMA.Decoder;
import lib.BasePatcher;
import lib.CertKeyStoreManager;

import javax.xml.bind.DatatypeConverter;
import java.io.*;
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
public class LauncherPatcher extends BasePatcher {

    private final String DOWNLOAD_URL = "https://s3.amazonaws.com/Minecraft.Download/launcher/launcher.pack.lzma";
    private final String ORIGINAL_CERT_CHECKSUM = "Sj8xWBxbm84OU915qY0tpT+l4RbDoWw8NtuZHxUrJVQ=";

    public void savePatchedLauncher() throws CertificateException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException, IOException {
        savePatchedJar(getJarInputStream(), "launcher.jar");
    }

    protected boolean entryWriter(ZipInputStream zis, ZipEntry inEntry, ZipOutputStream zos) throws CertificateException, NoSuchAlgorithmException, KeyStoreException, KeyManagementException, IOException {
        if (inEntry.getName().equalsIgnoreCase("yggdrasil_session_pubkey.der")) {
            ZipEntry entry = new ZipEntry(inEntry.getName());
            byte[] cert = getSessionServerCertificate();
            zos.putNextEntry(entry);
            zos.write(cert, 0, cert.length);
            return true;
        } else if (inEntry.getName().equalsIgnoreCase("META-INF/MANIFEST.MF")) {
            Scanner scanner = new Scanner(zis).useDelimiter("\\A");
            String manifest = scanner.hasNext() ? scanner.next() : "";
            byte[] cert = getSessionServerCertificate();
            manifest = manifest.replaceAll("(?s)" + Pattern.quote(ORIGINAL_CERT_CHECKSUM), sha256Digest(cert));

            ZipEntry entry = new ZipEntry(inEntry.getName());
            zos.putNextEntry(entry);
            zos.write(manifest.getBytes(), 0, manifest.length());
            return true;
        } else if (skipFile(inEntry.getName())) {
            return true;
        }

        return false;
    }

    private boolean skipFile(String filename) {
        return filename.equalsIgnoreCase("META-INF/MOJANGCS.RSA") || filename.equalsIgnoreCase("META-INF/MOJANGCS.SF");
    }

    private String sha256Digest(byte[] file) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(file);
        return DatatypeConverter.printBase64Binary(md.digest());
    }

    private InputStream getJarInputStream() throws IOException {
        InputStream archiveStream = getDownloadInputStream(DOWNLOAD_URL);
        InputStream packStream = unzip(archiveStream);
        return unpackJar(packStream);
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
