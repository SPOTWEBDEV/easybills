<?php

namespace App\Controllers;

use App\Core\EpinsClient;
use App\Core\EpinsException;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\ElectricityProvider;
use App\Models\PricingRule;
use App\Models\Transaction;
use App\Models\Wallet;
use RuntimeException;
use Throwable;

class ElectricityController
{
    public function providers(Request $request): void
    {
        $providers = array_map([ElectricityProvider::class, 'toPublicArray'], ElectricityProvider::all());
        Response::success($providers);
    }

    public function lookupMeter(Request $request): void
    {
        $data = $request->all();
        $validator = Validator::make()
            ->required($data, ['providerId', 'meterNumber', 'meterType'])
            ->regex($data, 'meterNumber', '/^\d{10,13}$/', 'Enter a valid meter number.');

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $provider = ElectricityProvider::find($data['providerId']);
        if (!$provider) {
            Response::error('Select a valid distribution company.', 422);
            return;
        }

        try {
            $client = new EpinsClient();
            $result = $client->validateMeter($provider['id'], $data['meterNumber'], $data['meterType']);

            if (!EpinsClient::isSuccess($result)) {
                Response::error(EpinsClient::errorMessage($result), 422);
                return;
            }

            $desc = $result['description'] ?? [];
            Response::success([
                'customerName' => $desc['Customer'] ?? 'Unknown customer',
                'address' => $desc['Address'] ?? '',
            ]);
        } catch (EpinsException|Throwable $e) {
            Response::error('Could not verify this meter right now. Please try again.', 502);
        }
    }

    public function purchase(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $data = $request->all();

        $validator = Validator::make()
            ->required($data, ['providerId', 'meterNumber', 'meterType', 'amount'])
            ->numeric($data, 'amount')
            ->min($data, 'amount', 500);

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $provider = ElectricityProvider::find($data['providerId']);
        if (!$provider) {
            Response::error('Select a valid distribution company.', 422);
            return;
        }

        $costPrice = (float) $data['amount'];
        $rule = PricingRule::forCategory('electricity');
        $fee = round($costPrice * 0.01, 2);
        if ($rule) {
            $fee = PricingRule::applyMargin($costPrice, $rule) - $costPrice;
        }
        $totalDebit = $costPrice + $fee;

        try {
            $wallet = Wallet::debit($userId, $totalDebit);
        } catch (RuntimeException $e) {
            Response::error('Insufficient wallet balance.', 422);
            return;
        }

        $reference = 'EB-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6)) . substr((string) time(), -6);

        try {
            $client = new EpinsClient();
            $providerResponse = $client->generateElectricityToken(
                $provider['id'],
                $data['meterNumber'],
                $data['meterType'],
                $costPrice,
                $reference
            );

            if (!EpinsClient::isSuccess($providerResponse)) {
                Wallet::credit($userId, $totalDebit);
                $failTxnId = Transaction::create([
                    'user_id' => $userId,
                    'reference' => $reference,
                    'category' => 'electricity',
                    'title' => $provider['name'],
                    'subtitle' => 'Meter ' . $data['meterNumber'],
                    'amount' => $costPrice,
                    'fee' => $fee,
                    'status' => 'failed',
                    'provider' => $provider['name'],
                    'recipient' => $data['meterNumber'],
                    'provider_payload' => $providerResponse,
                ]);
                Response::error(EpinsClient::errorMessage($providerResponse), 422, [
                    'transaction' => Transaction::toPublicArray(Transaction::find($failTxnId)),
                ]);
                return;
            }

            $wallet = Wallet::findByUserId($userId);
            $desc = $providerResponse['description'] ?? [];
            $token = $desc['Token'] ?? null;

            $txnId = Transaction::create([
                'user_id' => $userId,
                'reference' => $reference,
                'category' => 'electricity',
                'title' => $provider['name'],
                'subtitle' => 'Meter ' . $data['meterNumber'],
                'amount' => $costPrice,
                'fee' => $fee,
                'status' => 'success',
                'provider' => $provider['name'],
                'recipient' => $data['meterNumber'],
                'balance_after' => $wallet['balance'],
                'provider_ref' => $desc['Token'] ?? null,
                'provider_payload' => $providerResponse,
            ]);

            $response = ['transaction' => Transaction::toPublicArray(Transaction::find($txnId))];
            if ($token) {
                $response['token'] = $token;
            }

            Response::success($response);
        } catch (EpinsException|Throwable $e) {
            Wallet::credit($userId, $totalDebit);
            $failTxnId = Transaction::create([
                'user_id' => $userId,
                'reference' => $reference,
                'category' => 'electricity',
                'title' => $provider['name'],
                'subtitle' => 'Meter ' . $data['meterNumber'],
                'amount' => $costPrice,
                'fee' => $fee,
                'status' => 'failed',
                'provider' => $provider['name'],
                'recipient' => $data['meterNumber'],
            ]);
            Response::error('We could not reach the provider. Your wallet has been refunded.', 502, [
                'transaction' => Transaction::toPublicArray(Transaction::find($failTxnId)),
            ]);
        }
    }
}
