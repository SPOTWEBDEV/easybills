<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class Withdrawal
{
    public static function create(array $data): int
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'INSERT INTO withdrawals (user_id, amount, fee, bank_name, account_number, status, requested_at)
             VALUES (:user_id, :amount, :fee, :bank_name, :account_number, :status, NOW())'
        );
        $stmt->execute([
            'user_id' => $data['user_id'],
            'amount' => $data['amount'],
            'fee' => $data['fee'] ?? 0,
            'bank_name' => $data['bank_name'],
            'account_number' => $data['account_number'],
            'status' => $data['status'] ?? 'pending',
        ]);
        return (int) $db->lastInsertId();
    }

    public static function pending(): array
    {
        $db = Database::connection();
        $stmt = $db->query(
            "SELECT w.*, u.full_name AS customer_name FROM withdrawals w
             JOIN users u ON u.id = w.user_id
             WHERE w.status = 'pending' ORDER BY w.requested_at ASC"
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function find(int $id): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM withdrawals WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function setStatus(int $id, string $status): void
    {
        $db = Database::connection();
        $stmt = $db->prepare('UPDATE withdrawals SET status = :status, processed_at = NOW() WHERE id = :id');
        $stmt->execute(['status' => $status, 'id' => $id]);
    }
}
