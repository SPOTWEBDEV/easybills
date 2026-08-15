<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class User
{
    public static function create(array $data): int
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'INSERT INTO users (full_name, email, phone, password_hash, avatar_initials, kyc_status, tier, status, created_at)
             VALUES (:full_name, :email, :phone, :password_hash, :avatar_initials, :kyc_status, :tier, :status, NOW())'
        );
        $stmt->execute([
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'password_hash' => $data['password_hash'],
            'avatar_initials' => $data['avatar_initials'],
            'kyc_status' => $data['kyc_status'] ?? 'unverified',
            'tier' => $data['tier'] ?? 'Tier 1',
            'status' => $data['status'] ?? 'pending_verification',
        ]);
        return (int) $db->lastInsertId();
    }

    public static function findByEmail(string $email): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function findByPhone(string $phone): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM users WHERE phone = :phone LIMIT 1');
        $stmt->execute(['phone' => $phone]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function find(int $id): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function activate(int $id): void
    {
        $db = Database::connection();
        $stmt = $db->prepare("UPDATE users SET status = 'active' WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    public static function updatePassword(int $id, string $passwordHash): void
    {
        $db = Database::connection();
        $stmt = $db->prepare('UPDATE users SET password_hash = :hash WHERE id = :id');
        $stmt->execute(['hash' => $passwordHash, 'id' => $id]);
    }

    public static function setStatus(int $id, string $status): void
    {
        $db = Database::connection();
        $stmt = $db->prepare('UPDATE users SET status = :status WHERE id = :id');
        $stmt->execute(['status' => $status, 'id' => $id]);
    }

    public static function all(int $limit = 100, int $offset = 0): array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function initials(string $fullName): string
    {
        $parts = preg_split('/\s+/', trim($fullName));
        $initials = array_map(fn ($p) => mb_strtoupper(mb_substr($p, 0, 1)), array_slice($parts, 0, 2));
        return implode('', $initials) ?: 'U';
    }

    public static function toPublicArray(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'fullName' => $row['full_name'],
            'email' => $row['email'],
            'phone' => $row['phone'],
            'avatarInitials' => $row['avatar_initials'],
            'kycStatus' => $row['kyc_status'],
            'tier' => $row['tier'],
            'createdAt' => gmdate('c', strtotime($row['created_at'])),
        ];
    }
}
