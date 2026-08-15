<?php

namespace App\Controllers;

use App\Core\Env;
use App\Core\PaystackClient;
use App\Core\Request;
use App\Core\Response;
use App\Models\Transaction;
use App\Models\Wallet;

class PaystackWebhookController
{
    public function handle(Request $request): void
    {
        $rawBody = file_get_contents('php://input');
        $signature = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? null;
        $secret = (string) Env::get('PAYSTACK_SECRET_KEY', '');

        if (!PaystackClient::verifyWebhookSignature($rawBody, $signature, $secret)) {
            // Do NOT reveal why — just reject. Respond quickly either way;
            // Paystack retries failed (non-200) deliveries.
            Response::error('Invalid signature.', 401);
            return;
        }

        $event = json_decode($rawBody, true);
        if (!is_array($event)) {
            Response::error('Invalid payload.', 400);
            return;
        }

        // Acknowledge immediately so Paystack doesn't retry — we've already
        // verified authenticity above, so it's safe to process synchronously
        // for this simple case. For higher volume, push to a queue instead.
        if (($event['event'] ?? null) === 'charge.success') {
            $this->handleChargeSuccess($event['data'] ?? []);
        }

        Response::success(['received' => true]);
    }

    private function handleChargeSuccess(array $data): void
    {
        $reference = $data['reference'] ?? null;
        $amountKobo = (int) ($data['amount'] ?? 0);
        $status = $data['status'] ?? null;

        if (!$reference || $status !== 'success') {
            return;
        }

        $transaction = Transaction::findPendingByReference($reference, 'wallet-funding');
        if (!$transaction) {
            // Already processed (idempotency), or not one of ours — ignore.
            return;
        }

        $expectedKobo = (int) round(((float) $transaction['amount']) * 100);
        if ($amountKobo !== $expectedKobo) {
            // Amount mismatch — do not credit. Leave as pending for manual review.
            error_log("Paystack webhook amount mismatch for {$reference}: expected {$expectedKobo}kobo, got {$amountKobo}kobo");
            return;
        }

        $wallet = Wallet::credit((int) $transaction['user_id'], (float) $transaction['amount']);
        Transaction::markSuccess((int) $transaction['id'], $wallet['balance'], $reference);
    }
}
