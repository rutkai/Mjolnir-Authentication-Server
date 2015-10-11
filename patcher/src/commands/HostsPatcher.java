package commands;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Pattern;

/**
 * (Un)Patches the hosts file to use a custom server
 *
 * @author András Rutkai
 * @since 2015.10.03.
 */
public class HostsPatcher {

    private final Pattern IP_PATTERN = Pattern.compile("^(([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.){3}([01]?\\d\\d?|2[0-4]\\d|25[0-5])$");

    public void patch(String address) throws IOException {
        if (!isIP(address)) {
            address = getIPAddress(address);
        }

        patchHostsFileWithIP(address);
    }

    public void unpatch() throws IOException {
        String hosts = readHostsFile();
        if (!isPatched(hosts)) {
            return;
        }

        hosts = stripHosts(hosts);
        writeHostsFile(hosts);
    }

    private boolean isIP(final String ip) {
        return IP_PATTERN.matcher(ip).matches();
    }

    private String getIPAddress(String domain) throws UnknownHostException {
        InetAddress address = InetAddress.getByName(domain);
        return address.getHostAddress();
    }

    private void patchHostsFileWithIP(String ip) throws IOException {
        String hosts = readHostsFile();
        if (isPatched(hosts)) {
            return;
        }

        hosts = addHosts(hosts, ip);
        writeHostsFile(hosts);
    }

    private String readHostsFile() throws IOException {
        Path path = getPath();
        return new String(Files.readAllBytes(path), StandardCharsets.UTF_8);
    }

    private void writeHostsFile(String content) throws IOException {
        Path path = getPath();
        Files.write(path, content.getBytes());
    }

    private Path getPath() {
        if (isWin()) {
            return Paths.get("C:\\Windows\\system32\\drivers\\etc\\hosts");
        }

        return Paths.get("/etc/hosts");
    }

    private boolean isWin() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }

    private boolean isPatched(String hosts) {
        return hosts.contains("authserver.mojang.com") || hosts.contains("sessionserver.mojang.com");
    }

    private String addHosts(String file, String ip) {
        return file + "\n" +
                 ip + " authserver.mojang.com\n" +
                 ip + " sessionserver.mojang.com\n";
    }

    private String stripHosts(String file) {
        return file
                .replaceAll("(?m)^[0-9.]+\\s+authserver\\.mojang\\.com\\n?$", "")
                .replaceAll("(?m)^[0-9.]+\\s+sessionserver\\.mojang\\.com\\n?$", "");
    }

}
