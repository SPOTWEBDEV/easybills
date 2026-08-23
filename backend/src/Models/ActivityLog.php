<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class ActivityLog
{
    public static function record(?int $userId, string $action, string $device): void
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'INSERT INTO activity_logs (user_id, action, device, created_at) VALUES (:user_id, :action, :device, NOW())'
        );
        $stmt->execute(['user_id' => $userId, 'action' => $action, 'device' => $device]);
    }

    public static function paginated(int $page, int $perPage): array
    {
        $db = Database::connection();
        $offset = ($page - 1) * $perPage;

        $total = (int) $db->query('SELECT COUNT(*) FROM activity_logs')->fetchColumn();

        $stmt = $db->prepare(
            'SELECT a.*, u.full_name AS user_name FROM activity_logs a
             LEFT JOIN users u ON u.id = a.user_id
             ORDER BY a.created_at DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue('limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [$stmt->fetchAll(PDO::FETCH_ASSOC), $total];
    }

    /** Best-effort device label from the User-Agent header. Not exact, just readable. */
    public static function deviceFromUserAgent(?string $ua): string
    {
        if (!$ua) return 'Unknown device';

        $os = 'Unknown OS';
        if (str_contains($ua, 'iPhone')) $os = 'iPhone';
        elseif (str_contains($ua, 'Android')) $os = 'Android';
        elseif (str_contains($ua, 'Windows')) $os = 'Windows';
        elseif (str_contains($ua, 'Mac OS')) $os = 'macOS';
        elseif (str_contains($ua, 'Linux')) $os = 'Linux';

        $browser = 'Browser';
        if (str_contains($ua, 'Chrome')) $browser = 'Chrome';
        elseif (str_contains($ua, 'Safari') && !str_contains($ua, 'Chrome')) $browser = 'Safari';
        elseif (str_contains($ua, 'Firefox')) $browser = 'Firefox';

        return "{$os} — {$browser}";
    }
}