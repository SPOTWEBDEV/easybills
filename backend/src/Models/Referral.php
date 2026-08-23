<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class Referral
{
    public static function generateCode(string $fullName, int $userId): string
    {
        $base = strtoupper(preg_replace('/[^A-Za-z]/', '', explode(' ', $fullName)[0] ?? 'USER'));
        $base = substr($base, 0, 6) ?: 'USER';
        return $base . $userId . '00';
    }

    public static function create(int $referrerId, int $referredId, float $rewardAmount): int
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'INSERT INTO referrals (referrer_id, referred_id, reward_amount, status, created_at)
             VALUES (:referrer_id, :referred_id, :reward_amount, :status, NOW())'
        );
        $stmt->execute([
            'referrer_id' => $referrerId,
            'referred_id' => $referredId,
            'reward_amount' => $rewardAmount,
            'status' => 'pending',
        ]);
        return (int) $db->lastInsertId();
    }

    public static function findPendingByReferred(int $referredUserId): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            "SELECT * FROM referrals WHERE referred_id = :referred_id AND status = 'pending' LIMIT 1"
        );
        $stmt->execute(['referred_id' => $referredUserId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function markEarned(int $id): void
    {
        $db = Database::connection();
        $stmt = $db->prepare("UPDATE referrals SET status = 'earned' WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    public static function historyForUser(int $userId): array
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'SELECT r.*, u.full_name AS referred_name FROM referrals r
             JOIN users u ON u.id = r.referred_id
             WHERE r.referrer_id = :user_id
             ORDER BY r.created_at DESC'
        );
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function summaryForUser(int $userId): array
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            "SELECT
                COUNT(*) AS total_invites,
                SUM(CASE WHEN status = 'earned' THEN reward_amount ELSE 0 END) AS total_earned
             FROM referrals WHERE referrer_id = :user_id"
        );
        $stmt->execute(['user_id' => $userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return [
            'totalInvites' => (int) ($row['total_invites'] ?? 0),
            'totalEarned' => (float) ($row['total_earned'] ?? 0),
        ];
    }

    public static function topReferrers(int $limit = 10): array
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            "SELECT u.full_name AS name,
                    COUNT(*) AS invites,
                    SUM(CASE WHEN r.status = 'earned' THEN r.reward_amount ELSE 0 END) AS earned,
                    MAX(r.created_at) AS last_referral
             FROM referrals r
             JOIN users u ON u.id = r.referrer_id
             GROUP BY r.referrer_id, u.full_name
             ORDER BY earned DESC
             LIMIT :limit"
        );
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function programStats(): array
    {
        $db = Database::connection();
        $row = $db->query(
            "SELECT COUNT(*) AS total, SUM(CASE WHEN status='earned' THEN reward_amount ELSE 0 END) AS paid_out,
                    SUM(CASE WHEN status='earned' THEN 1 ELSE 0 END) AS earned_count
             FROM referrals"
        )->fetch(PDO::FETCH_ASSOC);
        $total = (int) ($row['total'] ?? 0);
        $earned = (int) ($row['earned_count'] ?? 0);
        return [
            'totalReferrals' => $total,
            'rewardsPaidOut' => (float) ($row['paid_out'] ?? 0),
            'conversionRate' => $total > 0 ? round(($earned / $total) * 100) : 0,
        ];
    }

    /**
     * Called after a purchase succeeds. If this user was referred and their
     * referral reward hasn't been paid out yet, pays the referrer (and
     * marks the referral earned) — this is the "first successful purchase"
     * trigger from the referral program settings.
     */
    public static function tryRewardOnFirstPurchase(int $purchasingUserId): void
    {
        $referral = self::findPendingByReferred($purchasingUserId);
        if (!$referral) {
            return;
        }

        self::markEarned((int) $referral['id']);

        $wallet = Wallet::credit((int) $referral['referrer_id'], (float) $referral['reward_amount']);
        Transaction::create([
            'user_id' => $referral['referrer_id'],
            'reference' => 'EB-REF' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6)),
            'category' => 'wallet-funding',
            'title' => 'Referral reward',
            'subtitle' => 'A friend you referred made their first purchase',
            'amount' => (float) $referral['reward_amount'],
            'fee' => 0,
            'status' => 'success',
            'balance_after' => $wallet['balance'],
        ]);
    }
}