<?php

namespace App\Controllers;

use App\Core\ActivityLog;
use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\User;

class SecurityController
{
    public function changePassword(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $data = $request->all();

        $validator = Validator::make()
            ->required($data, ['currentPassword', 'newPassword'])
            ->minLength($data, 'newPassword', 6);

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        if (!User::verifyPassword($userId, $data['currentPassword'])) {
            Response::error('Current password is incorrect.', 401);
            return;
        }

        User::updatePassword($userId, password_hash($data['newPassword'], PASSWORD_BCRYPT));

        \App\Models\ActivityLog::record($userId, 'Changed password', \App\Models\ActivityLog::deviceFromUserAgent($_SERVER['HTTP_USER_AGENT'] ?? null));

        Response::success(['success' => true]);
    }

    public function setTransactionPin(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $data = $request->all();

        $validator = Validator::make()
            ->required($data, ['pin'])
            ->regex($data, 'pin', '/^\d{4}$/', 'PIN must be exactly 4 digits.');

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        // If a PIN already exists, require the current one to change it —
        // unless this is the very first time it's being set.
        if (User::hasTransactionPin($userId)) {
            if (empty($data['currentPin']) || !User::verifyTransactionPin($userId, (string) $data['currentPin'])) {
                Response::error('Current PIN is incorrect.', 401);
                return;
            }
        }

        User::setTransactionPin($userId, (string) $data['pin']);

        \App\Models\ActivityLog::record($userId, 'Set transaction PIN', \App\Models\ActivityLog::deviceFromUserAgent($_SERVER['HTTP_USER_AGENT'] ?? null));

        Response::success(['success' => true]);
    }

    public function verifyTransactionPin(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $data = $request->all();

        $validator = Validator::make()->required($data, ['pin']);
        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        if (!User::hasTransactionPin($userId)) {
            Response::error('No transaction PIN has been set yet.', 422);
            return;
        }

        $valid = User::verifyTransactionPin($userId, (string) $data['pin']);
        if (!$valid) {
            Response::error('Incorrect PIN.', 401);
            return;
        }

        Response::success(['valid' => true]);
    }

    public function setTwoFactor(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $data = $request->all();

        $validator = Validator::make()->required($data, ['enabled']);
        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $enabled = (bool) $data['enabled'];
        User::setTwoFactorEnabled($userId, $enabled);

        \App\Models\ActivityLog::record(
            $userId,
            $enabled ? 'Enabled two-factor authentication' : 'Disabled two-factor authentication',
            \App\Models\ActivityLog::deviceFromUserAgent($_SERVER['HTTP_USER_AGENT'] ?? null)
        );

        Response::success(['success' => true, 'twoFactorEnabled' => $enabled]);
    }
}