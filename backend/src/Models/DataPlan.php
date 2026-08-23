<?php

namespace App\Models;

use App\Core\Database;
use App\Core\EpinsClient;
use PDO;
use RuntimeException;

class DataPlan
{
    public static function forProvider(string $providerId): array
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            "SELECT * FROM data_plans WHERE provider_id = :provider_id AND status = 'active'
             ORDER BY FIELD(category, 'daily','weekly','monthly','other'), price ASC"
        );
        $stmt->execute(['provider_id' => $providerId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function find(string $id): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM data_plans WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function toPublicArray(array $row): array
    {
        return [
            'id' => $row['id'],
            'providerId' => $row['provider_id'],
            'label' => $row['label'],
            'size' => $row['size'],
            'validity' => $row['validity'],
            'category' => $row['category'] ?? 'other',
            'price' => (float) $row['price'],
            'costPrice' => (float) $row['cost_price'],
        ];
    }

    /**
     * Pulls the live plan list from ePINs' /v2/autho/variations/?service=data
     * and upserts every MTN/Airtel/9mobile/Glo plan into data_plans, with
     * the REAL epincode (needed by DataController::purchase to actually
     * place an order) and a sell price computed from the 'data' pricing
     * rule's margin. Returns how many plans were written.
     *
     * Safe to re-run any time — existing plans are updated in place
     * (matched by id = "dp_" + epincode), nothing is duplicated.
     */
    public static function syncFromEpins(EpinsClient $client): int
    {
        $response = $client->getVariations('data');
        if (!EpinsClient::isVariationsSuccess($response)) {
            throw new RuntimeException('ePINs did not return a valid data plan list (code ' . ($response['code'] ?? 'unknown') . ').');
        }

        $items = $response['description'];
        $rule = PricingRule::forCategory('data');
        $db = Database::connection();

        $stmt = $db->prepare(
            'INSERT INTO data_plans (id, provider_id, label, size, validity, category, datatype, price, cost_price, epins_plan_code, status)
             VALUES (:id, :provider_id, :label, :size, :validity, :category, :datatype, :price, :cost_price, :epins_plan_code, "active")
             ON DUPLICATE KEY UPDATE
                label = VALUES(label), size = VALUES(size), validity = VALUES(validity),
                category = VALUES(category), datatype = VALUES(datatype),
                price = VALUES(price), cost_price = VALUES(cost_price),
                epins_plan_code = VALUES(epins_plan_code)'
        );

        $count = 0;
        foreach ($items as $item) {
            $networkCode = (string) ($item['network'] ?? '');
            $providerId = EpinsClient::DATA_NETWORK_ID_TO_PROVIDER[$networkCode] ?? null;
            if (!$providerId) {
                continue; // network code we don't sell (or a typo in the feed) — skip safely
            }

            $planName = trim((string) ($item['plan'] ?? ''));
            $epincode = trim((string) ($item['epincode'] ?? ''));
            $costPrice = (float) ($item['price_api'] ?? 0);
            $datatype = (string) ($item['datatype'] ?? '');

            if ($planName === '' || $epincode === '' || $costPrice <= 0) {
                continue;
            }

            [$sizeLabel, $validity] = self::splitPlanName($planName);
            $category = self::categorize($planName);
            $sellPrice = PricingRule::applyMargin($costPrice, $rule);

            $stmt->execute([
                'id' => 'dp_' . $epincode,
                'provider_id' => $providerId,
                'label' => $planName,
                'size' => $sizeLabel,
                'validity' => $validity !== '' ? $validity : 'N/A',
                'category' => $category,
                'datatype' => $datatype ?: null,
                'price' => $sellPrice,
                'cost_price' => $costPrice,
                'epins_plan_code' => $epincode,
            ]);
            $count++;
        }

        return $count;
    }

    /**
     * "1GB (CG_LITE)  - 30 Days" -> ["1GB (CG_LITE)", "30 Days"]
     * Falls back to using the whole string as the size label if there's
     * no " - " separator (some feeds format plans slightly differently).
     */
    private static function splitPlanName(string $planName): array
    {
        $parts = preg_split('/\s*-\s*/', $planName, 2);
        $sizeLabel = trim($parts[0] ?? $planName);
        $validity = trim($parts[1] ?? '');
        return [$sizeLabel, $validity];
    }

    /**
     * Buckets a plan into Daily / Weekly / Monthly based on its validity,
     * handling the feed's inconsistent spacing/casing ("30 Days",
     * "30days", "7 days", "14days", etc).
     */
    public static function categorize(string $planName): string
    {
        if (preg_match('/(\d+)\s*(day|days)/i', $planName, $m)) {
            $days = (int) $m[1];
            if ($days <= 1) return 'daily';
            if ($days <= 14) return 'weekly';
            return 'monthly';
        }
        if (preg_match('/(\d+)\s*(month|months)/i', $planName)) {
            return 'monthly';
        }
        if (preg_match('/(\d+)\s*(hour|hours)/i', $planName)) {
            return 'daily';
        }
        return 'other';
    }
}