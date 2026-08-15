<?php

namespace App\Controllers\Admin;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\AdminUser;
use App\Models\AuditLog;

class AdminAuthController
{
    public function login(Request $request): void
    {
        $data = $request->all();
        $validator = Validator::make()->required($data, ['email', 'password'])->email($data, 'email');
        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $admin = AdminUser::findByEmail($data['email']);
        if (!$admin || !password_verify($data['password'], $admin['password_hash'])) {
            Response::error('Incorrect email or password.', 401);
            return;
        }
        if ($admin['status'] !== 'active') {
            Response::error('This admin account is disabled.', 403);
            return;
        }

        $token = Auth::issueAdminToken((int) $admin['id'], $admin['role']);

        AuditLog::record($admin['email'], 'Admin login', $admin['email'], $request->ip());

        Response::success([
            'admin' => AdminUser::toPublicArray($admin),
            'token' => $token,
        ]);
    }

    public function me(Request $request): void
    {
        $adminId = (int) $request->param('auth_admin_id');
        $admin = AdminUser::find($adminId);
        if (!$admin) {
            Response::error('Admin not found.', 404);
            return;
        }
        Response::success(['admin' => AdminUser::toPublicArray($admin)]);
    }
}
