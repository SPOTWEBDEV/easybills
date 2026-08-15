<?php

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\Wallet;
use PDO;

class CustomerController
{
    public function index(Request $request): void
    {
        $db = Database::connection();
        $stmt = $db->query(
            'SELECT u.*, w.balance AS wallet_balance FROM users u
             LEFT JOIN wallets w ON w.user_id = u.id
             ORDER BY u.created_at DESC LIMIT 200'
        );
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success(array_map(fn ($r) => [
            'id' => (string) $r['id'],
            'name' => $r['full_name'],
            'email' => $r['email'],
            'phone' => $r['phone'],
            'walletBalance' => (float) ($r['wallet_balance'] ?? 0),
            'tier' => $r['tier'],
            'kycStatus' => $r['kyc_status'],
            'status' => $r['status'] === 'pending_verification' ? 'active' : $r['status'],
            'joinedAt' => gmdate('c', strtotime($r['created_at'])),
        ], $rows));
    }

    public function show(Request $request): void
    {
        $id = (int) $request->param('id');
        $user = User::find($id);
        if (!$user) {
            Response::error('Customer not found.', 404);
            return;
        }
        $wallet = Wallet::findByUserId($id);
        Response::success([
            'user' => User::toPublicArray($user),
            'wallet' => $wallet ? Wallet::toPublicArray($wallet) : null,
        ]);
    }

    public function suspend(Request $request): void
    {
        $id = (int) $request->param('id');
        User::setStatus($id, 'suspended');
        AuditLog::record($request->param('auth_admin_id'), 'Suspended user account', "user_id={$id}", $request->ip());
        Response::success(['success' => true]);
    }

    public function reactivate(Request $request): void
    {
        $id = (int) $request->param('id');
        User::setStatus($id, 'active');
        AuditLog::record($request->param('auth_admin_id'), 'Reactivated user account', "user_id={$id}", $request->ip());
        Response::success(['success' => true]);
    }
}
