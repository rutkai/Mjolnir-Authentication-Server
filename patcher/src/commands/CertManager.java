/*
 * Copyright 2006 Sun Microsystems, Inc.  All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 *   - Neither the name of Sun Microsystems nor the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

package commands;

import lib.CertKeyStoreManager;

import javax.net.ssl.*;
import java.io.IOException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

/**
 * Certificate management class
 *
 * @author András Rutkai
 * @since 2015.10.06.
 */
public class CertManager {

    private CertKeyStoreManager keyStoreManager;

    public CertManager(CertKeyStoreManager keyStoreManager) {
        this.keyStoreManager = keyStoreManager;
    }

    public void installCert(String host) throws Exception {
        X509Certificate cert = getCert(host);

        String alias = host + "-" + 1;
        keyStoreManager.getKeyStore().setCertificateEntry(alias, cert);
    }

    public X509Certificate getCert(String host) throws NoSuchAlgorithmException, KeyStoreException, IOException, KeyManagementException {
        TrustManagerFactory tmf =
                TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
        tmf.init(keyStoreManager.getKeyStore());
        X509TrustManager defaultTrustManager = (X509TrustManager) tmf.getTrustManagers()[0];
        SavingTrustManager tm = new SavingTrustManager(defaultTrustManager);

        performHandshake(tm, host);

        X509Certificate[] chain = tm.chain;
        if (chain == null) {
            throw new KeyManagementException("Could not obtain server certificate chain");
        }
        return chain[0];
    }

    private void performHandshake(SavingTrustManager tm, String host) throws KeyManagementException, NoSuchAlgorithmException, IOException {
        SSLSocket socket = (SSLSocket) createSSLSocketFactory(tm).createSocket(host, 443);
        socket.setSoTimeout(10000);
        try {
            socket.startHandshake();
            socket.close();
        } catch (SSLException e) {
            // Certificate has not been added yet
        }
    }

    private SSLSocketFactory createSSLSocketFactory(SavingTrustManager tm) throws NoSuchAlgorithmException, KeyManagementException {
        SSLContext context = SSLContext.getInstance("TLS");
        context.init(null, new TrustManager[]{tm}, null);
        return context.getSocketFactory();
    }

    private static class SavingTrustManager implements X509TrustManager {
        private final X509TrustManager tm;

        private X509Certificate[] chain;

        SavingTrustManager(X509TrustManager tm) {
            this.tm = tm;
        }

        public X509Certificate[] getAcceptedIssuers() {
            throw new UnsupportedOperationException();
        }

        public void checkClientTrusted(X509Certificate[] chain, String authType)
                throws CertificateException {
            throw new UnsupportedOperationException();
        }

        public void checkServerTrusted(X509Certificate[] chain, String authType)
                throws CertificateException {
            this.chain = chain;
            tm.checkServerTrusted(chain, authType);
        }

    }

}
