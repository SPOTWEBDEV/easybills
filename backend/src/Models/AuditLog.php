<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class AuditLog
{
    public static function record(string $actor, string $action, string $target, string $ip): void
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'INSERT INTO audit_logs (actor, action, target, ip_address, created_at) VALUES (:actor, :action, :target, :ip, NOW())'
        );
        $stmt->execute(['actor' => $actor, 'action' => $action, 'target' => $target, 'ip' => $ip]);
    }

    public static function all(int $limit = 100): array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT :limit');
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
