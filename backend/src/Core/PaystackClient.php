<?php

namespace App\Core;

/**
 * Wraps the Paystack Transactions API (https://paystack.com/docs/api/transaction/)
 * for real wallet funding via card/bank transfer.
 *
 * Flow:
 *   1. WalletController::initializeFunding() calls initializeTransaction()
 *      and returns the `authorization_url` to the frontend, which redirects
 *      the browser there to complete payment.
 *   2. Paystack calls our webhook (PaystackWebhookController) with a
 *      `charge.success` event once payment completes. We verify the
 *      signature, then credit the wallet.
 *   3. As a safety net, the frontend's callback page can also call
 *      verifyTransaction() directly — Paystack recommends confirming via
 *      webhook OR verify, and always checking amount + status before
 *      delivering value.
 */
class PaystackClient
{
    private string $secretKey;
    private string $baseUrl = 'https://api.paystack.co';
    private int $timeout;

    public function __construct(?string $secretKey = null, ?int $timeout = null)
    {
        $this->secretKey = $secretKey ?? (string) Env::get('PAYSTACK_SECRET_KEY', '');
        $this->timeout = $timeout ?? (int) Env::get('PAYSTACK_TIMEOUT_SECONDS', 20);
    }

    private function request(string $method, string $path, array $params = []): array
    {
        if ($this->secretKey === '') {
            throw new PaystackException('PAYSTACK_SECRET_KEY is not configured.');
        }

        $ch = curl_init();
        $url = $this->baseUrl . $path;

        $headers = [
            'Authorization: Bearer ' . $this->secretKey,
            'Content-Type: application/json',
        ];

        if (strtoupper($method) === 'GET') {
            curl_setopt($ch, CURLOPT_HTTPGET, true);
        } else {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
        }

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $raw = curl_exec($ch);
        $errNo = curl_errno($ch);
        $errMsg = curl_error($ch);
        curl_close($ch);

        if ($errNo !== 0) {
            throw new PaystackException("Paystack request failed: {$errMsg}", $errNo);
        }

        $decoded = json_decode((string) $raw, true);
        if (!is_array($decoded)) {
            throw new PaystackException('Paystack returned an unreadable response.');
        }

        return $decoded;
    }

    /**
     * @param float $amountNaira Amount in Naira — converted to kobo internally.
     */
    public function initializeTransaction(string $email, float $amountNaira, string $reference, ?string $callbackUrl = null): array
    {
        $params = [
            'email' => $email,
            'amount' => (int) round($amountNaira * 100), // Paystack expects kobo
            'reference' => $reference,
        ];
        if ($callbackUrl) {
            $params['callback_url'] = $callbackUrl;
        }

        return $this->request('POST', '/transaction/initialize', $params);
    }

    public function verifyTransaction(string $reference): array
    {
        return $this->request('GET', '/transaction/verify/' . rawurlencode($reference));
    }

    public static function isInitializeSuccess(array $response): bool
    {
        return ($response['status'] ?? false) === true && !empty($response['data']['authorization_url']);
    }

    public static function isVerifiedSuccessful(array $response): bool
    {
        return ($response['status'] ?? false) === true && (($response['data']['status'] ?? null) === 'success');
    }

    /**
     * Verifies the `x-paystack-signature` header: an HMAC-SHA512 hash of the
     * raw request body, signed with your secret key. Always verify against
     * the RAW body string — not a re-encoded/decoded version of it, since
     * that can silently change the signature.
     */
    public static function verifyWebhookSignature(string $rawBody, ?string $signatureHeader, string $secretKey): bool
    {
        if (!$signatureHeader) {
            return false;
        }
        $expected = hash_hmac('sha512', $rawBody, $secretKey);
        return hash_equals($expected, $signatureHeader);
    }
}
