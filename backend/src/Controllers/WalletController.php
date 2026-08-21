<?php

namespace App\Controllers;

use App\Core\PaystackClient;
use App\Core\PaystackException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\ActivityLog;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;

class WalletController
{
    private function generateRef(): string
    {
        return 'EB-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6)) . substr((string) time(), -6);
    }

    /**
     * Real production wallet funding: creates a pending transaction, then
     * asks Paystack for a checkout URL. The wallet is only credited once
     * PaystackWebhookController confirms a genuine `charge.success` event —
     * never from this endpoint directly.
     */
    public function initializeFunding(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $data = $request->all();

        $validator = Validator::make()
            ->required($data, ['amount'])
            ->numeric($data, 'amount')
            ->min($data, 'amount', 100);

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $user = User::find($userId);
        $amount = (float) $data['amount'];
        $reference = $this->generateRef();

        Transaction::create([
            'user_id' => $userId,
            'reference' => $reference,
            'category' => 'wallet-funding',
            'title' => 'Wallet Funding',
            'subtitle' => 'Via Paystack',
            'amount' => $amount,
            'fee' => 0,
            'status' => 'pending',
        ]);

        try {
            $client = new PaystackClient();
            $callbackUrl = $data['callbackUrl'] ?? null;
            $response = $client->initializeTransaction($user['email'], $amount, $reference, $callbackUrl);

            if (!PaystackClient::isInitializeSuccess($response)) {
                Response::error($response['message'] ?? 'Could not start payment. Please try again.', 502);
                return;
            }

            Response::success([
                'authorizationUrl' => $response['data']['authorization_url'],
                'accessCode' => $response['data']['access_code'] ?? null,
                'reference' => $reference,
            ]);
        } catch (PaystackException|\Throwable $e) {
            Response::error('Could not reach the payment provider. Please try again.', 502);
        }
    }

    /**
     * DEMO / MANUAL TOP-UP ONLY — not the production funding path.
     *
     * This instantly credits the wallet from a client-supplied amount with
     * no payment actually collected, which is fine for local testing but
     * NEVER safe to expose publicly (anyone could credit their own wallet
     * for free). Either remove this route in production, restrict it to
     * admin-only manual adjustments, or leave it disabled.
     *
     * For real funding, use initializeFunding() + PaystackWebhookController,
     * which only credits the wallet after a verified Paystack payment.
     */
    public function fund(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $data = $request->all();

        $validator = Validator::make()
            ->required($data, ['amount', 'method'])
            ->numeric($data, 'amount')
            ->min($data, 'amount', 100);

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $amount = (float) $data['amount'];
        $methodLabel = match ($data['method']) {
            'card' => 'Via Debit Card',
            'virtual_account' => 'Via Virtual Account',
            default => 'Via Bank Transfer',
        };

        $wallet = Wallet::credit($userId, $amount);

        $reference = $this->generateRef();
        $txnId = Transaction::create([
            'user_id' => $userId,
            'reference' => $reference,
            'category' => 'wallet-funding',
            'title' => 'Wallet Funding',
            'subtitle' => $methodLabel,
            'amount' => $amount,
            'fee' => 0,
            'status' => 'success',
            'balance_after' => $wallet['balance'],
        ]);

        Response::success([
            'transaction' => Transaction::toPublicArray(Transaction::find($txnId)),
            'wallet' => Wallet::toPublicArray($wallet),
        ]);
    }

    public function show(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $wallet = Wallet::findByUserId($userId);
        if (!$wallet) {
            Response::error('Wallet not found.', 404);
            return;
        }
        Response::success(Wallet::toPublicArray($wallet));
    }
}