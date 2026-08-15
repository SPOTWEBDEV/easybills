<?php

namespace App\Core;

/**
 * Wraps https://www.epins.com.ng/developers/ — our upstream wholesale
 * provider for airtime, data, electricity, TV, exams, and betting.
 *
 * All EasyBills product/pricing logic (margin, wallet debit, transaction
 * records) lives OUTSIDE this class, in the controllers. This class only
 * knows how to talk to ePINs and normalize error handling.
 *
 * Response codes (from ePINs docs):
 *   101 success · 102 low balance · 103 invalid API key · 104 duplicate ref
 *   105 failed · 107 invalid amount · 108 below minimum · 118 missing service id
 *   119 lookup/validation success (meter, smartcard, betting account)
 *   207 pin unavailable · 303 invalid service id · 304 unauthorized
 *   400 invalid request method · 1007 blocked · 1009 account blocked
 */
class EpinsClient
{
    private string $baseUrl;
    private string $apiKey;
    private int $timeout;

    /** Network name -> ePINs `network` param for the /airtime/ endpoint. */
    public const AIRTIME_NETWORK_MAP = [
        'mtn' => 'mtn',
        'airtel' => 'airtel',
        'glo' => 'glo',
        '9mobile' => 'etisalat',
    ];

    /** Network name -> ePINs `networkId` param for the /data/ endpoint. */
    public const DATA_NETWORK_ID_MAP = [
        'mtn' => '01',
        'glo' => '02',
        '9mobile' => '03',
        'airtel' => '04',
    ];

    public function __construct(?string $baseUrl = null, ?string $apiKey = null, ?int $timeout = null)
    {
        $mode = Env::get('EPINS_MODE', 'sandbox');
        $this->baseUrl = rtrim($baseUrl ?? (
            $mode === 'live'
                ? Env::get('EPINS_LIVE_BASE_URL', 'https://api.epins.com.ng')
                : Env::get('EPINS_SANDBOX_BASE_URL', 'https://sandbox.epins.com.ng')
        ), '/');
        $this->apiKey = $apiKey ?? (string) Env::get('EPINS_API_KEY', '');
        $this->timeout = $timeout ?? (int) Env::get('EPINS_TIMEOUT_SECONDS', 25);
    }

    /**
     * @throws EpinsException on network failure or non-2xx transport error.
     * Business-logic failures (e.g. code 102 low balance) are returned as a
     * normal array so the caller can inspect `code`/`description`.
     */
    private function request(string $method, string $path, array $params = []): array
    {
        if ($this->apiKey === '') {
            throw new EpinsException('EPINS_API_KEY is not configured.');
        }

        $url = $this->baseUrl . $path;
        $ch = curl_init();

        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json',
            'Accept: application/json',
        ];

        if (strtoupper($method) === 'GET') {
            if (!empty($params)) {
                $url .= (str_contains($url, '?') ? '&' : '?') . http_build_query($params);
            }
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
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($errNo !== 0) {
            throw new EpinsException("ePINs request failed: {$errMsg}", $errNo);
        }

        $decoded = json_decode((string) $raw, true);
        if (!is_array($decoded)) {
            throw new EpinsException("ePINs returned an unreadable response (HTTP {$httpCode}).", $httpCode);
        }

        return $decoded;
    }

    public function walletBalance(): array
    {
        return $this->request('GET', '/account/');
    }

    public function purchaseAirtime(string $network, string $phone, float $amount, string $ref): array
    {
        $mapped = self::AIRTIME_NETWORK_MAP[$network] ?? $network;
        return $this->request('POST', '/airtime/', [
            'network' => $mapped,
            'phone' => $phone,
            'amount' => $amount,
            'ref' => $ref,
        ]);
    }

    public function purchaseData(string $network, string $phone, string $dataPlanCode, string $ref): array
    {
        $networkId = self::DATA_NETWORK_ID_MAP[$network] ?? $network;
        return $this->request('POST', '/data/', [
            'networkId' => $networkId,
            'MobileNumber' => $phone,
            'DataPlan' => $dataPlanCode,
            'ref' => $ref,
        ]);
    }

    public function getVariations(string $service): array
    {
        // Documented as a flat endpoint outside the {{baseurl}} product paths.
        return $this->request('GET', '/v2/autho/variations/', ['service' => $service]);
    }

    public function validateMeter(string $serviceId, string $meterNumber, string $meterType): array
    {
        return $this->request('POST', '/merchant-verify/', [
            'serviceId' => $serviceId,
            'billerNumber' => $meterNumber,
            'vcode' => $meterType,
        ]);
    }

    public function generateElectricityToken(string $serviceId, string $meterNumber, string $meterType, float $amount, string $ref): array
    {
        return $this->request('POST', '/biller/', [
            'service' => $serviceId,
            'accountno' => $meterNumber,
            'vcode' => $meterType,
            'amount' => $amount,
            'ref' => $ref,
        ]);
    }

    public function validateSmartcard(string $serviceId, string $smartcardNumber): array
    {
        return $this->request('POST', '/merchant-verify/', [
            'serviceId' => $serviceId,
            'billerNumber' => $smartcardNumber,
            'vcode' => $serviceId,
        ]);
    }

    public function rechargeDecoder(string $serviceId, string $smartcardNumber, string $planCode, float $amount, string $ref): array
    {
        return $this->request('POST', '/biller/', [
            'service' => $serviceId,
            'accountno' => $smartcardNumber,
            'vcode' => $planCode,
            'amount' => $amount,
            'ref' => $ref,
        ]);
    }

    public function purchaseExamPin(string $service, string $variationCode, float $amount, int $quantity, string $ref): array
    {
        return $this->request('POST', '/exams/', [
            'service' => $service,
            'vcode' => $variationCode,
            'amount' => $amount,
            'quantity' => $quantity,
            'ref' => $ref,
        ]);
    }

    public function validateBettingAccount(string $serviceId, string $customerId): array
    {
        return $this->request('POST', '/merchant-verify/', [
            'serviceId' => $serviceId,
            'billerNumber' => $customerId,
            'vcode' => $serviceId,
        ]);
    }

    public function topupBetting(string $network, string $customerId, string $reference, float $amount, string $customerName, string $requestId): array
    {
        return $this->request('POST', '/betting/', [
            'network' => $network,
            'customerId' => $customerId,
            'reference' => $reference,
            'amount' => $amount,
            'customerName' => $customerName,
            'request_id' => $requestId,
        ]);
    }

    public function purchaseRechargeCardPins(string $network, int $denomination, int $quantity, string $cardName, string $ref): array
    {
        return $this->request('POST', '/epin/', [
            'network' => $network,
            'pinDenomination' => $denomination,
            'pinQuantity' => $quantity,
            'cardname' => $cardName,
            'ref' => $ref,
        ]);
    }

    public static function isSuccess(array $response): bool
    {
        $code = (int) ($response['code'] ?? 0);
        return in_array($code, [101, 119], true);
    }

    public static function errorMessage(array $response): string
    {
        $code = (int) ($response['code'] ?? 0);
        $map = [
            102 => 'ePINs wallet balance is too low to process this transaction. Please contact support.',
            103 => 'Invalid ePINs API credentials.',
            104 => 'Duplicate transaction reference.',
            105 => 'The provider could not complete this transaction. Please try again.',
            107 => 'Invalid amount for this product.',
            108 => 'Amount is below the minimum allowed for this product.',
            118 => 'Missing service ID for this product.',
            207 => 'Requested PIN denomination is currently unavailable.',
            303 => 'Invalid service ID.',
            304 => 'Your account is not authorized for this product.',
            400 => 'Invalid request method.',
            1007 => 'This transaction was blocked by the provider.',
            1009 => 'The provider account is locked. Please contact support.',
        ];
        $code = (int) ($response['code'] ?? 0);
        return $map[$code]
            ?? ($response['description']['response_description'] ?? null)
            ?? 'The provider could not process this request.';
    }
}
