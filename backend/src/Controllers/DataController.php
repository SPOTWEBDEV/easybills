<?php

namespace App\Controllers;

use App\Core\EpinsClient;
use App\Core\EpinsException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\ActivityLog;
use App\Models\DataPlan;
use App\Models\NetworkProvider;
use App\Models\Referral;
use App\Models\Transaction;
use App\Models\Wallet;
use RuntimeException;
use Throwable;

class DataController
{
    public function providers(Request $request): void
    {
        $providers = array_map([NetworkProvider::class, 'toPublicArray'], NetworkProvider::all());
        Response::success($providers);
    }

    public function plans(Request $request): void
    {
        $providerId = $request->query('provider_id') ?? $request->query('providerId');
        if (!$providerId) {
            Response::error('provider_id is required.', 422);
            return;
        }
        $plans = array_map([DataPlan::class, 'toPublicArray'], DataPlan::forProvider($providerId));
        Response::success($plans);
    }

    public function purchase(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $data = $request->all();

        $validator = Validator::make()
            ->required($data, ['providerId', 'planId', 'phone'])
            ->regex($data, 'phone', '/^0\d{10}$/', 'Enter a valid 11-digit phone number.');

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $provider = NetworkProvider::find($data['providerId']);
        $plan = DataPlan::find($data['planId']);
        if (!$provider || !$plan || $plan['provider_id'] !== $provider['id']) {
            Response::error('Select a valid network and data plan.', 422);
            return;
        }

        $sellPrice = (float) $plan['price'];

        try {
            $wallet = Wallet::debit($userId, $sellPrice);
        } catch (RuntimeException $e) {
            Response::error('Insufficient wallet balance.', 422);
            return;
        }

        $reference = 'EB-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6)) . substr((string) time(), -6);
        $title = $provider['name'] . ' ' . $plan['label'];

        try {
            $client = new EpinsClient();
            $providerResponse = $client->purchaseData($provider['id'], $data['phone'], (string) $plan['epins_plan_code'], $reference);

            if (!EpinsClient::isSuccess($providerResponse)) {
                Wallet::credit($userId, $sellPrice);
                $failTxnId = Transaction::create([
                    'user_id' => $userId,
                    'reference' => $reference,
                    'category' => 'data',
                    'title' => $title,
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
                'category' => 'data',
                'title' => $title,
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

            Referral::tryRewardOnFirstPurchase($userId);
            ActivityLog::record($userId, "Purchased {$title}", ActivityLog::deviceFromUserAgent($_SERVER['HTTP_USER_AGENT'] ?? null));

            Response::success(['transaction' => Transaction::toPublicArray(Transaction::find($txnId))]);
        } catch (EpinsException|Throwable $e) {
            Wallet::credit($userId, $sellPrice);
            $failTxnId = Transaction::create([
                'user_id' => $userId,
                'reference' => $reference,
                'category' => 'data',
                'title' => $title,
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