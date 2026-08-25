<?php

namespace App\Controllers;

use App\Core\EpinsClient;
use App\Core\EpinsException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\NetworkProvider;
use App\Models\PricingRule;
use App\Models\Transaction;
use App\Models\Wallet;
use RuntimeException;
use Throwable;
use App\Models\ActivityLog;
use App\Models\User;

class AirtimeController
{
    public function providers(Request $request): void
    {
        $providers = array_map([NetworkProvider::class, 'toPublicArray'], NetworkProvider::all());
        Response::success($providers);
    }

    public function purchase(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $data = $request->all();

        $validator = Validator::make()
            ->required($data, ['providerId', 'phone', 'amount'])
            ->regex($data, 'phone', '/^0\d{10}$/', 'Enter a valid 11-digit phone number.')
            ->numeric($data, 'amount')
            ->min($data, 'amount', 50);

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $provider = NetworkProvider::find($data['providerId']);
        if (!$provider) {
            Response::error('Select a valid network provider.', 422);
            return;
        }

        if (User::hasTransactionPin($userId)) {
            if (empty($data['transactionPin'])) {
                Response::error('Enter your transaction PIN to continue.', 422, ['requiresPin' => true]);
                return;
            }
            if (!User::verifyTransactionPin($userId, (string) $data['transactionPin'])) {
                Response::error('Incorrect transaction PIN.', 401, ['requiresPin' => true]);
                return;
            }
        }

        $costPrice = (float) $data['amount'];
        $rule = PricingRule::forCategory('airtime');
        $sellPrice = PricingRule::applyMargin($costPrice, $rule);

        // Reserve funds from the customer's wallet BEFORE calling the
        // upstream provider, so we never spend real provider balance
        // against an unfunded purchase.
        try {
            $wallet = Wallet::debit($userId, $sellPrice);
        } catch (RuntimeException $e) {
            Response::error('Insufficient wallet balance.', 422);
            return;
        }

        $reference = 'EB-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6)) . substr((string) time(), -6);

        try {
            $client = new EpinsClient();
            $providerResponse = $client->purchaseAirtime($provider['id'], $data['phone'], $costPrice, $reference);

            if (!EpinsClient::isSuccess($providerResponse)) {
                Wallet::credit($userId, $sellPrice);
                $failTxnId = Transaction::create([
                    'user_id' => $userId,
                    'reference' => $reference,
                    'category' => 'airtime',
                    'title' => $provider['name'] . ' Airtime',
                    'subtitle' => $data['phone'],
                    'amount' => $sellPrice,
                    'fee' => 0,
                    'status' => 'failed',
                    'provider' => $provider['name'],
                    'recipient' => $data['phone'],
                    'provider_payload' => $providerResponse,
                ]);
                Response::error(EpinsClient::errorMessage($providerResponse), 422, [
                    'transaction' => Transaction::toPublicArray(Transaction::find($failTxnId)),
                ]);
                return;
            }

            $wallet = Wallet::findByUserId($userId);
            $txnId = Transaction::create([
                'user_id' => $userId,
                'reference' => $reference,
                'category' => 'airtime',
                'title' => $provider['name'] . ' Airtime',
                'subtitle' => $data['phone'],
                'amount' => $sellPrice,
                'fee' => 0,
                'status' => 'success',
                'provider' => $provider['name'],
                'recipient' => $data['phone'],
                'balance_after' => $wallet['balance'],
                'provider_ref' => $providerResponse['description']['ref'] ?? null,
                'provider_payload' => $providerResponse,
            ]);

            ActivityLog::record($userId, "Purchased {$provider['name']} airtime", ActivityLog::deviceFromUserAgent($_SERVER['HTTP_USER_AGENT'] ?? null));

            Response::success(['transaction' => Transaction::toPublicArray(Transaction::find($txnId))]);
        } catch (EpinsException | Throwable $e) {
            // Network/transport failure talking to ePINs — refund and record.
            Wallet::credit($userId, $sellPrice);
            $failTxnId = Transaction::create([
                'user_id' => $userId,
                'reference' => $reference,
                'category' => 'airtime',
                'title' => $provider['name'] . ' Airtime',
                'subtitle' => $data['phone'],
                'amount' => $sellPrice,
                'fee' => 0,
                'status' => 'failed',
                'provider' => $provider['name'],
                'recipient' => $data['phone'],
            ]);
            Response::error('We could not reach the provider. Your wallet has been refunded.', 502, [
                'transaction' => Transaction::toPublicArray(Transaction::find($failTxnId)),
            ]);
        }
    }
}
