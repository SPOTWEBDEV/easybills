<?php

namespace App\Controllers;

use App\Core\PaystackClient;
use App\Core\PaystackException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;

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

        // NOTE: In production, this endpoint should be called by your payment
        // gateway's webhook (Paystack/Flutterwave) after a verified payment,
        // not directly by the client — otherwise a user could fake a funding
        // call. Wire that verification in before going live.
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

    public function withdraw(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $data = $request->all();

        $validator = Validator::make()
            ->required($data, ['amount', 'bankName', 'accountNumber'])
            ->numeric($data, 'amount')
            ->min($data, 'amount', 500)
            ->regex($data, 'accountNumber', '/^\d{10}$/', 'Enter a valid 10-digit account number.');

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $amount = (float) $data['amount'];
        $fee = 25.0;

        try {
            $wallet = Wallet::debit($userId, $amount + $fee);
        } catch (\RuntimeException $e) {
            Response::error('Insufficient wallet balance.', 422);
            return;
        }

        Withdrawal::create([
            'user_id' => $userId,
            'amount' => $amount,
            'fee' => $fee,
            'bank_name' => $data['bankName'],
            'account_number' => $data['accountNumber'],
            'status' => 'pending', // requires admin approval — see AdminWithdrawalController
        ]);

        $reference = $this->generateRef();
        $txnId = Transaction::create([
            'user_id' => $userId,
            'reference' => $reference,
            'category' => 'withdrawal',
            'title' => 'Withdrawal to ' . $data['bankName'],
            'subtitle' => '**** ' . substr($data['accountNumber'], -4),
            'amount' => $amount,
            'fee' => $fee,
            'status' => 'pending',
            'balance_after' => $wallet['balance'],
        ]);

        Response::success([
            'transaction' => Transaction::toPublicArray(Transaction::find($txnId)),
            'wallet' => Wallet::toPublicArray($wallet),
        ]);
    }
}
