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
        $accountNumber = self::generateAccountNumber();
        $stmt = $db->prepare(
            'INSERT INTO wallets (user_id, balance, cashback, account_number, bank_name, account_name, created_at, updated_at)
             VALUES (:user_id, 0, 0, :account_number, :bank_name, :account_name, NOW(), NOW())'
        );
        $stmt->execute([
            'user_id' => $userId,
            'account_number' => $accountNumber,
            'bank_name' => 'EasyBills Microfinance Bank',
            'account_name' => 'PENDING', // updated once we know the user's name
        ]);
    }

    private static function generateAccountNumber(): string
    {
        return '90' . str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
    }

    public static function findByUserId(int $userId): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM wallets WHERE user_id = :user_id LIMIT 1');
        $stmt->execute(['user_id' => $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function setAccountName(int $userId, string $name): void
    {
        $db = Database::connection();
        $stmt = $db->prepare('UPDATE wallets SET account_name = :name WHERE user_id = :user_id');
        $stmt->execute(['name' => strtoupper($name), 'user_id' => $userId]);
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
            'accountNumber' => $row['account_number'],
            'bankName' => $row['bank_name'],
            'accountName' => $row['account_name'],
        ];
    }
}
