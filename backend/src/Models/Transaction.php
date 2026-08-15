<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class Transaction
{
    public static function create(array $data): int
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'INSERT INTO transactions
                (user_id, reference, category, title, subtitle, amount, fee, status, provider, recipient, balance_after, provider_ref, provider_payload, created_at)
             VALUES
                (:user_id, :reference, :category, :title, :subtitle, :amount, :fee, :status, :provider, :recipient, :balance_after, :provider_ref, :provider_payload, NOW())'
        );
        $stmt->execute([
            'user_id' => $data['user_id'],
            'reference' => $data['reference'],
            'category' => $data['category'],
            'title' => $data['title'],
            'subtitle' => $data['subtitle'],
            'amount' => $data['amount'],
            'fee' => $data['fee'] ?? 0,
            'status' => $data['status'],
            'provider' => $data['provider'] ?? null,
            'recipient' => $data['recipient'] ?? null,
            'balance_after' => $data['balance_after'] ?? null,
            'provider_ref' => $data['provider_ref'] ?? null,
            'provider_payload' => isset($data['provider_payload']) ? json_encode($data['provider_payload']) : null,
        ]);
        return (int) $db->lastInsertId();
    }

    public static function findPendingByReference(string $reference, string $category): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            "SELECT * FROM transactions WHERE reference = :reference AND category = :category AND status = 'pending' LIMIT 1"
        );
        $stmt->execute(['reference' => $reference, 'category' => $category]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function markSuccess(int $id, ?float $balanceAfter, ?string $providerRef = null): void
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'UPDATE transactions SET status = :status, balance_after = :balance_after, provider_ref = :provider_ref WHERE id = :id'
        );
        $stmt->execute([
            'status' => 'success',
            'balance_after' => $balanceAfter,
            'provider_ref' => $providerRef,
            'id' => $id,
        ]);
    }

    public static function find(int $id): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM transactions WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function findByReferenceForUser(string $idOrRef, int $userId): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'SELECT * FROM transactions WHERE (id = :id OR reference = :ref) AND user_id = :user_id LIMIT 1'
        );
        $stmt->execute([
            'id' => is_numeric($idOrRef) ? $idOrRef : -1,
            'ref' => $idOrRef,
            'user_id' => $userId,
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function listForUser(int $userId, array $filters = [], int $limit = 50, int $offset = 0): array
    {
        $db = Database::connection();
        $where = ['user_id = :user_id'];
        $params = ['user_id' => $userId];

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $where[] = 'status = :status';
            $params['status'] = $filters['status'];
        }
        if (!empty($filters['category']) && $filters['category'] !== 'all') {
            $where[] = 'category = :category';
            $params['category'] = $filters['category'];
        }
        if (!empty($filters['query'])) {
            $where[] = '(title LIKE :q OR reference LIKE :q OR subtitle LIKE :q)';
            $params['q'] = '%' . $filters['query'] . '%';
        }

        $sql = 'SELECT * FROM transactions WHERE ' . implode(' AND ', $where) . ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset';
        $stmt = $db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function summaryForUser(int $userId): array
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            "SELECT
                COUNT(*) AS total_count,
                SUM(CASE WHEN status = 'success' THEN amount + fee ELSE 0 END) AS total_spent,
                SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS success_count
             FROM transactions WHERE user_id = :user_id"
        );
        $stmt->execute(['user_id' => $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        $totalCount = (int) ($row['total_count'] ?? 0);
        $successCount = (int) ($row['success_count'] ?? 0);

        return [
            'totalSpent' => (float) ($row['total_spent'] ?? 0),
            'totalCount' => $totalCount,
            'successRate' => $totalCount > 0 ? (int) round(($successCount / $totalCount) * 100) : 0,
        ];
    }

    public static function toPublicArray(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'reference' => $row['reference'],
            'category' => $row['category'],
            'title' => $row['title'],
            'subtitle' => $row['subtitle'],
            'amount' => (float) $row['amount'],
            'fee' => (float) $row['fee'],
            'status' => $row['status'],
            'date' => gmdate('c', strtotime($row['created_at'])),
            'provider' => $row['provider'],
            'recipient' => $row['recipient'],
            'balanceAfter' => $row['balance_after'] !== null ? (float) $row['balance_after'] : null,
        ];
    }
}
