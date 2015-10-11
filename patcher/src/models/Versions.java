package models;

import java.util.List;

public class Versions {
    public LatestVersion latest;
    public List<Version> versions;

    public String getVersions() {
        StringBuilder sb = new StringBuilder();
        for (Version version : versions) {
            sb.append(version.id);
            sb.append(" ");
        }

        return sb.toString();
    }

    public boolean hasVersion(String version) {
        for (Version item : versions) {
            if (item.id.equals(version)) {
                return true;
            }
        }
        return false;
    }
}
