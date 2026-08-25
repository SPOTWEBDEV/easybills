<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class PushSubscription
{
    public static function save(int $userId, string $endpoint, string $p256dh, string $auth, ?string $userAgent): void
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent, created_at)
             VALUES (:user_id, :endpoint, :p256dh, :auth, :user_agent, NOW())
             ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), p256dh = VALUES(p256dh), auth = VALUES(auth), user_agent = VALUES(user_agent)'
        );
        $stmt->execute([
            'user_id' => $userId,
            'endpoint' => $endpoint,
            'p256dh' => $p256dh,
            'auth' => $auth,
            'user_agent' => $userAgent,
        ]);
    }

    public static function remove(string $endpoint): void
    {
        $db = Database::connection();
        $stmt = $db->prepare('DELETE FROM push_subscriptions WHERE endpoint = :endpoint');
        $stmt->execute(['endpoint' => $endpoint]);
    }

    public static function allForUser(int $userId): array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM push_subscriptions WHERE user_id = :user_id');
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Silently drops a subscription the push service reports as gone (410/404). */
    public static function removeDead(string $endpoint): void
    {
        self::remove($endpoint);
    }
}