<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class AdminUser
{
    public static function findByEmail(string $email): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM admin_users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function find(int $id): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM admin_users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function toPublicArray(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'name' => $row['name'],
            'email' => $row['email'],
            'role' => $row['role'],
        ];
    }
}
