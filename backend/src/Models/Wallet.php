<?php

namespace App\Models;

use App\Core\Database;
use PDO;
use RuntimeException;

class Wallet
{
    public static function createForUser(int $userId): void
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'INSERT INTO wallets (user_id, balance, cashback, created_at, updated_at)
             VALUES (:user_id, 0, 0, NOW(), NOW())'
        );
        $stmt->execute(['user_id' => $userId]);
    }

    public static function findByUserId(int $userId): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM wallets WHERE user_id = :user_id LIMIT 1');
        $stmt->execute(['user_id' => $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    /**
     * Atomically credit a wallet. Safe under concurrent requests because the
     * UPDATE itself performs the arithmetic in SQL.
     */
    public static function credit(int $userId, float $amount): array
    {
        $db = Database::connection();
        $stmt = $db->prepare('UPDATE wallets SET balance = balance + :amount, updated_at = NOW() WHERE user_id = :user_id');
        $stmt->execute(['amount' => $amount, 'user_id' => $userId]);
        return self::findByUserId($userId);
    }

    /**
     * Atomically debit a wallet, guarding against overdraft with a
     * conditional UPDATE. Throws if there isn't enough balance.
     */
    public static function debit(int $userId, float $amount): array
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'UPDATE wallets SET balance = balance - :amount, updated_at = NOW()
             WHERE user_id = :user_id AND balance >= :amount_check'
        );
        $stmt->execute(['amount' => $amount, 'user_id' => $userId, 'amount_check' => $amount]);

        if ($stmt->rowCount() === 0) {
            throw new RuntimeException('Insufficient wallet balance.');
        }

        return self::findByUserId($userId);
    }

    public static function addCashback(int $userId, float $amount): void
    {
        $db = Database::connection();
        $stmt = $db->prepare('UPDATE wallets SET cashback = cashback + :amount WHERE user_id = :user_id');
        $stmt->execute(['amount' => $amount, 'user_id' => $userId]);
    }

    public static function toPublicArray(array $row): array
    {
        return [
            'balance' => (float) $row['balance'],
            'cashback' => (float) $row['cashback'],
            'currency' => 'NGN',
        ];
    }
}