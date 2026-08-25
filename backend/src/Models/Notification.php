<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class Notification
{
    public static function create(int $userId, string $title, string $body, string $type = 'general'): int
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'INSERT INTO notifications (user_id, title, body, type, created_at) VALUES (:user_id, :title, :body, :type, NOW())'
        );
        $stmt->execute(['user_id' => $userId, 'title' => $title, 'body' => $body, 'type' => $type]);
        return (int) $db->lastInsertId();
    }

    public static function paginatedForUser(int $userId, int $page, int $perPage): array
    {
        $db = Database::connection();
        $offset = ($page - 1) * $perPage;

        $totalStmt = $db->prepare('SELECT COUNT(*) FROM notifications WHERE user_id = :user_id');
        $totalStmt->execute(['user_id' => $userId]);
        $total = (int) $totalStmt->fetchColumn();

        $stmt = $db->prepare(
            'SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue('user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue('limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [$stmt->fetchAll(PDO::FETCH_ASSOC), $total];
    }

    public static function unreadCountForUser(int $userId): int
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT COUNT(*) FROM notifications WHERE user_id = :user_id AND read_at IS NULL');
        $stmt->execute(['user_id' => $userId]);
        return (int) $stmt->fetchColumn();
    }

    public static function markRead(int $id, int $userId): bool
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'UPDATE notifications SET read_at = NOW() WHERE id = :id AND user_id = :user_id AND read_at IS NULL'
        );
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        return $stmt->rowCount() > 0;
    }

    public static function markAllRead(int $userId): int
    {
        $db = Database::connection();
        $stmt = $db->prepare('UPDATE notifications SET read_at = NOW() WHERE user_id = :user_id AND read_at IS NULL');
        $stmt->execute(['user_id' => $userId]);
        return $stmt->rowCount();
    }

    public static function toPublicArray(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'title' => $row['title'],
            'body' => $row['body'],
            'type' => $row['type'],
            'read' => $row['read_at'] !== null,
            'createdAt' => gmdate('c', strtotime($row['created_at'])),
        ];
    }
}