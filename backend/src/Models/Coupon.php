<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class Coupon
{
    public static function all(): array
    {
        $db = Database::connection();
        $stmt = $db->query('SELECT * FROM coupons ORDER BY created_at DESC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function findByCode(string $code): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM coupons WHERE code = :code LIMIT 1');
        $stmt->execute(['code' => strtoupper($code)]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function create(array $data): int
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'INSERT INTO coupons (code, discount_type, value, usage_limit, used, expires_at, status, created_at)
             VALUES (:code, :discount_type, :value, :usage_limit, 0, :expires_at, :status, NOW())'
        );
        $stmt->execute([
            'code' => strtoupper($data['code']),
            'discount_type' => $data['discount_type'],
            'value' => $data['value'],
            'usage_limit' => $data['usage_limit'],
            'expires_at' => $data['expires_at'],
            'status' => $data['status'] ?? 'active',
        ]);
        return (int) $db->lastInsertId();
    }

    public static function incrementUsage(int $id): void
    {
        $db = Database::connection();
        $stmt = $db->prepare('UPDATE coupons SET used = used + 1 WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }
}
