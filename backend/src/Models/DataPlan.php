<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class DataPlan
{
    public static function forProvider(string $providerId): array
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            "SELECT * FROM data_plans WHERE provider_id = :provider_id AND status = 'active' ORDER BY price ASC"
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
            'price' => (float) $row['price'],
            'costPrice' => (float) $row['cost_price'],
        ];
    }
}
