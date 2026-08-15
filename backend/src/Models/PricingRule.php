<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class PricingRule
{
    public static function forCategory(string $category): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM pricing_rules WHERE service_category = :category LIMIT 1');
        $stmt->execute(['category' => $category]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function all(): array
    {
        $db = Database::connection();
        $stmt = $db->query('SELECT * FROM pricing_rules ORDER BY service_category ASC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function update(int $id, string $marginType, float $marginValue): void
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'UPDATE pricing_rules SET margin_type = :type, margin_value = :value, updated_at = NOW() WHERE id = :id'
        );
        $stmt->execute(['type' => $marginType, 'value' => $marginValue, 'id' => $id]);
    }

    /**
     * Applies the configured margin on top of a wholesale cost price.
     * This is the platform's "Profit System" from the product spec:
     * admin sets either a fixed markup (₦) or a percentage markup.
     */
    public static function applyMargin(float $costPrice, ?array $rule): float
    {
        if (!$rule) {
            return $costPrice;
        }
        if ($rule['margin_type'] === 'percentage') {
            return round($costPrice * (1 + ((float) $rule['margin_value'] / 100)), 2);
        }
        return round($costPrice + (float) $rule['margin_value'], 2);
    }

    public static function toPublicArray(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'service' => $row['service_category'],
            'marginType' => $row['margin_type'],
            'marginValue' => (float) $row['margin_value'],
            'updatedAt' => gmdate('c', strtotime($row['updated_at'])),
        ];
    }
}
