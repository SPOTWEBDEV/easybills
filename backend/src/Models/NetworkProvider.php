<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class NetworkProvider
{
    public static function all(): array
    {
        $db = Database::connection();
        $stmt = $db->query("SELECT * FROM network_providers WHERE status = 'active' ORDER BY name ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function find(string $id): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM network_providers WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function toPublicArray(array $row): array
    {
        return [
            'id' => $row['id'],
            'name' => $row['name'],
            'color' => $row['color'],
            'logoInitial' => $row['logo_initial'],
        ];
    }
}
