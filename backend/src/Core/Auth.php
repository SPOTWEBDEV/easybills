<?php

namespace App\Core;

class Auth
{
    public static function issueUserToken(int $userId): string
    {
        $secret = Env::get('JWT_SECRET');
        $ttl = (int) Env::get('JWT_TTL_MINUTES', 1440);
        return JWT::encode(['sub' => $userId, 'type' => 'user'], $secret, $ttl);
    }

    public static function issueAdminToken(int $adminId, string $role): string
    {
        $secret = Env::get('JWT_SECRET');
        $ttl = (int) Env::get('JWT_ADMIN_TTL_MINUTES', 480);
        return JWT::encode(['sub' => $adminId, 'type' => 'admin', 'role' => $role], $secret, $ttl);
    }

    public static function userIdFromRequest(Request $request): ?int
    {
        $token = $request->bearerToken();
        if (!$token) {
            return null;
        }
        $payload = JWT::decode($token, Env::get('JWT_SECRET'));
        if (!$payload || ($payload['type'] ?? null) !== 'user') {
            return null;
        }
        return (int) $payload['sub'];
    }

    public static function adminFromRequest(Request $request): ?array
    {
        $token = $request->bearerToken();
        if (!$token) {
            return null;
        }
        $payload = JWT::decode($token, Env::get('JWT_SECRET'));
        if (!$payload || ($payload['type'] ?? null) !== 'admin') {
            return null;
        }
        return ['id' => (int) $payload['sub'], 'role' => $payload['role'] ?? 'admin'];
    }
}
