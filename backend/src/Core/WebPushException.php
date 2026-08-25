<?php

namespace App\Core;

/**
 * ⚠ READ THIS BEFORE RELYING ON PUSH NOTIFICATIONS IN PRODUCTION.
 *
 * This implements the Web Push protocol (RFC 8291 message encryption +
 * RFC 8292 VAPID auth) in pure PHP with zero Composer dependencies, to
 * match this project's architecture. The VAPID JWT signing half is
 * solid — openssl_sign() natively supports EC/SHA256 signing, no gaps
 * there.
 *
 * The message ENCRYPTION half needs an ECDH key agreement over the P-256
 * curve, and PHP's OpenSSL extension has no built-in function for that
 * (there's no openssl_pkey_derive() for EC in core PHP, unlike Node's
 * crypto.createECDH or most other languages' standard libraries). The
 * only dependency-free way to do it is shelling out to the system
 * `openssl` CLI via shell_exec() — which many shared hosts (including a
 * lot of cPanel plans) disable for security.
 *
 * This class does that shell-out, with a clear exception if it's
 * unavailable. IT HAS NOT BEEN TESTED AGAINST A REAL PUSH SERVICE — I
 * built it from the RFC spec, but subtle encryption bugs are silent
 * failures (the push service just rejects the message), so please
 * actually test this against a real subscription before depending on
 * it. If it doesn't work on your host, the standard, well-tested fix is
 * `composer require minishlink/web-push` and swap this class's
 * send() method to call that library instead — everything else in this
 * notification system (storage, endpoints, frontend) stays the same.
 */
class WebPushClient
{
    private string $publicKey;
    private string $privateKey;
    private string $subject;

    public function __construct(?string $publicKey = null, ?string $privateKey = null, ?string $subject = null)
    {
        $this->publicKey = $publicKey ?? (string) Env::get('VAPID_PUBLIC_KEY', '');
        $this->privateKey = $privateKey ?? (string) Env::get('VAPID_PRIVATE_KEY', '');
        $this->subject = $subject ?? (string) Env::get('VAPID_SUBJECT', 'mailto:support@easybills.example');
    }

    public function publicKey(): string
    {
        return $this->publicKey;
    }

    /**
     * @param array{endpoint:string,p256dh:string,auth:string} $subscription
     * @return array{success:bool, statusCode:int, shouldRemove:bool, error:?string}
     */
    public function send(array $subscription, string $title, string $body, array $data = []): array
    {
        if ($this->publicKey === '' || $this->privateKey === '') {
            throw new WebPushException('VAPID keys are not configured.');
        }

        try {
            $payload = json_encode(['title' => $title, 'body' => $body, 'data' => $data]);
            $encrypted = $this->encryptPayload($subscription['p256dh'], $subscription['auth'], $payload);
        } catch (\Throwable $e) {
            throw new WebPushException(
                'Could not encrypt push payload (this environment likely cannot shell out to openssl — see the class doc comment): ' . $e->getMessage()
            );
        }

        $endpoint = $subscription['endpoint'];
        $audience = $this->originOf($endpoint);
        $vapidJwt = $this->signVapidJwt($audience);

        $headers = [
            'Authorization: vapid t=' . $vapidJwt . ', k=' . $this->publicKey,
            'Content-Type: application/octet-stream',
            'Content-Encoding: aes128gcm',
            'TTL: 60',
        ];

        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $encrypted,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
        ]);
        curl_exec($ch);
        $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return ['success' => false, 'statusCode' => 0, 'shouldRemove' => false, 'error' => $curlError];
        }

        // 201/200 = delivered to the push service's queue. 404/410 = the
        // subscription is dead (user revoked permission, uninstalled, etc.)
        // and should be deleted from our side.
        $success = $statusCode >= 200 && $statusCode < 300;
        $shouldRemove = in_array($statusCode, [404, 410], true);

        return ['success' => $success, 'statusCode' => $statusCode, 'shouldRemove' => $shouldRemove, 'error' => $success ? null : "HTTP {$statusCode}"];
    }

    private function originOf(string $url): string
    {
        $parts = parse_url($url);
        return ($parts['scheme'] ?? 'https') . '://' . ($parts['host'] ?? '');
    }

    private function signVapidJwt(string $audience): string
    {
        $header = $this->base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'ES256']));
        $payload = $this->base64UrlEncode(json_encode([
            'aud' => $audience,
            'exp' => time() + 12 * 3600,
            'sub' => $this->subject,
        ]));

        $signingInput = "{$header}.{$payload}";

        $pem = $this->vapidPrivateKeyToPem();
        $privateKeyResource = openssl_pkey_get_private($pem);
        if ($privateKeyResource === false) {
            throw new WebPushException('Invalid VAPID private key.');
        }

        openssl_sign($signingInput, $derSignature, $privateKeyResource, OPENSSL_ALGO_SHA256);

        // JOSE ES256 needs the raw (R||S, 64 bytes) signature format, but
        // openssl_sign() returns DER-encoded ECDSA — convert it.
        $rawSignature = $this->derToRawSignature($derSignature);

        return $signingInput . '.' . $this->base64UrlEncode($rawSignature);
    }

    /** Converts the browser's raw base64url VAPID public/private keys into PEM for OpenSSL. */
    private function vapidPrivateKeyToPem(): string
    {
        $rawPrivate = $this->base64UrlDecode($this->privateKey); // 32 bytes
        $rawPublic = $this->base64UrlDecode($this->publicKey);   // 65 bytes, uncompressed point

        if (strlen($rawPrivate) !== 32 || strlen($rawPublic) !== 65) {
            throw new WebPushException('VAPID keys are not in the expected raw P-256 format.');
        }

        // Build a minimal SEC1 EC PRIVATE KEY DER structure by hand (ASN.1),
        // since PHP has no "import raw EC scalar" helper.
        $der = $this->buildEcPrivateKeyDer($rawPrivate, $rawPublic);
        return "-----BEGIN EC PRIVATE KEY-----\n" . chunk_split(base64_encode($der), 64, "\n") . "-----END EC PRIVATE KEY-----\n";
    }

    private function buildEcPrivateKeyDer(string $privateKey, string $publicKey): string
    {
        // SEC1 ECPrivateKey ::= SEQUENCE {
        //   version INTEGER (1),
        //   privateKey OCTET STRING,
        //   parameters [0] OID prime256v1,
        //   publicKey [1] BIT STRING
        // }
        $version = "\x02\x01\x01";
        $privOctet = "\x04\x20" . $privateKey;
        $oid = "\xA0\x0A\x06\x08\x2A\x86\x48\xCE\x3D\x03\x01\x07"; // prime256v1 OID, tagged [0]
        $pubBits = "\x00" . $publicKey; // BIT STRING: no unused bits
        $pubField = "\xA1" . $this->derLength(strlen($pubBits) + 2) . "\x03" . $this->derLength(strlen($pubBits)) . $pubBits;

        $body = $version . $privOctet . $oid . $pubField;
        return "\x30" . $this->derLength(strlen($body)) . $body;
    }

    private function derLength(int $len): string
    {
        if ($len < 128) {
            return chr($len);
        }
        $bytes = ltrim(pack('N', $len), "\x00");
        return chr(0x80 | strlen($bytes)) . $bytes;
    }

    private function derToRawSignature(string $der): string
    {
        // DER SEQUENCE { INTEGER r, INTEGER s } -> raw 32-byte r || 32-byte s
        $offset = 2; // skip SEQUENCE tag + length byte(s) — assumes short form, true for P-256 sigs
        if ((ord($der[1]) & 0x80) !== 0) {
            $offset = 2 + (ord($der[1]) & 0x7F);
        }

        $offset++; // skip INTEGER tag for r
        $rLen = ord($der[$offset]);
        $offset++;
        $r = substr($der, $offset, $rLen);
        $offset += $rLen;

        $offset++; // skip INTEGER tag for s
        $sLen = ord($der[$offset]);
        $offset++;
        $s = substr($der, $offset, $sLen);

        $r = ltrim($r, "\x00");
        $s = ltrim($s, "\x00");
        $r = str_pad($r, 32, "\x00", STR_PAD_LEFT);
        $s = str_pad($s, 32, "\x00", STR_PAD_LEFT);

        return $r . $s;
    }

    /**
     * RFC 8291 message encryption. The ECDH step shells out to the system
     * `openssl` CLI — see this class's doc comment for why, and the risk
     * that entails on hosts without shell_exec enabled.
     */
    private function encryptPayload(string $p256dhB64, string $authB64, string $plaintext): string
    {
        if (!function_exists('shell_exec') || strtolower((string) ini_get('disable_functions')) !== '' && str_contains((string) ini_get('disable_functions'), 'shell_exec')) {
            throw new WebPushException('shell_exec() is disabled on this server — server-side ECDH for Web Push is not possible without it or a Composer crypto library.');
        }

        $clientPublicKey = $this->base64UrlDecode($p256dhB64);
        $authSecret = $this->base64UrlDecode($authB64);

        // 1. Generate an ephemeral EC keypair for this message.
        $ephemeral = openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]);
        if ($ephemeral === false) {
            throw new WebPushException('Could not generate ephemeral EC key.');
        }
        $details = openssl_pkey_get_details($ephemeral);
        $serverPublicKey = "\x04" . $details['ec']['x'] . $details['ec']['y']; // uncompressed point, 65 bytes

        openssl_pkey_export($ephemeral, $ephemeralPrivatePem);

        // 2. ECDH shared secret via the openssl CLI (see class doc comment).
        $sharedSecret = $this->deriveSharedSecretViaCli($ephemeralPrivatePem, $clientPublicKey);

        // 3. RFC 8291 key derivation.
        $keyInfo = "WebPush: info\x00" . $clientPublicKey . $serverPublicKey;
        $prkKey = hash_hmac('sha256', $sharedSecret, $authSecret, true);
        $ikm = hash_hmac('sha256', $keyInfo . "\x01", $prkKey, true);

        $salt = random_bytes(16);
        $prk = hash_hmac('sha256', $ikm, $salt, true);
        $cek = substr(hash_hmac('sha256', "Content-Encoding: aes128gcm\x00\x01", $prk, true), 0, 16);
        $nonce = substr(hash_hmac('sha256', "Content-Encoding: nonce\x00\x01", $prk, true), 0, 12);

        // 4. AES-128-GCM encrypt, with a single 0x02 padding-delimiter byte
        // appended per RFC 8188 (no additional padding used here).
        $padded = $plaintext . "\x02";
        $ciphertext = openssl_encrypt($padded, 'aes-128-gcm', $cek, OPENSSL_RAW_DATA, $nonce, $tag);
        if ($ciphertext === false) {
            throw new WebPushException('AES-GCM encryption failed.');
        }

        // 5. RFC 8188 aes128gcm content-coding header + body.
        $recordSize = pack('N', strlen($ciphertext . $tag) + 100); // generous fixed record size
        $keyIdLen = chr(strlen($serverPublicKey));

        return $salt . $recordSize . $keyIdLen . $serverPublicKey . $ciphertext . $tag;
    }

    private function deriveSharedSecretViaCli(string $ephemeralPrivatePem, string $clientPublicKeyRaw): string
    {
        $tmpDir = sys_get_temp_dir();
        $privKeyFile = tempnam($tmpDir, 'wp_priv_');
        $peerKeyFile = tempnam($tmpDir, 'wp_peer_');
        $secretFile = tempnam($tmpDir, 'wp_secret_');

        try {
            file_put_contents($privKeyFile, $ephemeralPrivatePem);

            // Wrap the raw 65-byte uncompressed client public key point in a
            // minimal SubjectPublicKeyInfo DER structure, then PEM-encode it.
            $spki = $this->buildEcPublicKeySpki($clientPublicKeyRaw);
            $peerPem = "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($spki), 64, "\n") . "-----END PUBLIC KEY-----\n";
            file_put_contents($peerKeyFile, $peerPem);

            $cmd = sprintf(
                'openssl pkeyutl -derive -inkey %s -peerkey %s -out %s 2>&1',
                escapeshellarg($privKeyFile),
                escapeshellarg($peerKeyFile),
                escapeshellarg($secretFile)
            );
            exec($cmd, $output, $exitCode);

            if ($exitCode !== 0 || !file_exists($secretFile) || filesize($secretFile) === 0) {
                throw new WebPushException('openssl pkeyutl -derive failed: ' . implode(' ', $output));
            }

            return (string) file_get_contents($secretFile);
        } finally {
            @unlink($privKeyFile);
            @unlink($peerKeyFile);
            @unlink($secretFile);
        }
    }

    private function buildEcPublicKeySpki(string $rawPoint): string
    {
        $algId = "\x30\x13\x06\x07\x2A\x86\x48\xCE\x3D\x02\x01\x06\x08\x2A\x86\x48\xCE\x3D\x03\x01\x07";
        $bitString = "\x00" . $rawPoint;
        $bitStringField = "\x03" . $this->derLength(strlen($bitString)) . $bitString;
        $body = $algId . $bitStringField;
        return "\x30" . $this->derLength(strlen($body)) . $body;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        $padded = str_pad($data, strlen($data) % 4 === 0 ? strlen($data) : strlen($data) + (4 - strlen($data) % 4), '=');
        return base64_decode(strtr($padded, '-_', '+/'));
    }
}