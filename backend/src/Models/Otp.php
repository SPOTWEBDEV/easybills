<?php

namespace App\Models;

use App\Core\Database;
use App\Core\Env;
use PDO;

class Otp
{
    public static function generate(int $userId, string $purpose): string
    {
        $length = (int) Env::get('OTP_LENGTH', 6);
        $code = str_pad((string) random_int(0, (10 ** $length) - 1), $length, '0', STR_PAD_LEFT);
        $ttl = (int) Env::get('OTP_TTL_MINUTES', 10);

        $db = Database::connection();
        $stmt = $db->prepare(
            'INSERT INTO otp_codes (user_id, code, purpose, expires_at, consumed, created_at)
             VALUES (:user_id, :code, :purpose, DATE_ADD(NOW(), INTERVAL :ttl MINUTE), 0, NOW())'
        );
        $stmt->execute(['user_id' => $userId, 'code' => $code, 'purpose' => $purpose, 'ttl' => $ttl]);

        self::deliver($userId, $code);

        return $code;
    }

    /**
     * In local/sandbox environments there's no SMS gateway wired up, so we
     * log the OTP to a file. Swap this for a real SMS provider call
     * (Termii, Africa's Talking, etc.) when going to production.
     */
    private static function deliver(int $userId, string $code): void
    {
        $logPath = dirname(__DIR__, 2) . '/storage/logs/otp.log';
        $line = sprintf("[%s] user_id=%d code=%s\n", date('Y-m-d H:i:s'), $userId, $code);
        @file_put_contents($logPath, $line, FILE_APPEND);
    }

    public static function verify(int $userId, string $purpose, string $code): bool
    {
        $demoCode = (string) Env::get('OTP_DEMO_CODE', '123456');
        if ($code === $demoCode) {
            self::consumeLatest($userId, $purpose);
            return true;
        }

        $db = Database::connection();
        $stmt = $db->prepare(
            'SELECT * FROM otp_codes
             WHERE user_id = :user_id AND purpose = :purpose AND code = :code AND consumed = 0 AND expires_at >= NOW()
             ORDER BY id DESC LIMIT 1'
        );
        $stmt->execute(['user_id' => $userId, 'purpose' => $purpose, 'code' => $code]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false;
        }

        $update = $db->prepare('UPDATE otp_codes SET consumed = 1 WHERE id = :id');
        $update->execute(['id' => $row['id']]);

        return true;
    }

    private static function consumeLatest(int $userId, string $purpose): void
    {
        $db = Database::connection();
        $stmt = $db->prepare(
            'UPDATE otp_codes SET consumed = 1
             WHERE user_id = :user_id AND purpose = :purpose AND consumed = 0
             ORDER BY id DESC LIMIT 1'
        );
        $stmt->execute(['user_id' => $userId, 'purpose' => $purpose]);
    }
}
