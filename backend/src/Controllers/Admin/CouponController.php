<?php

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\AuditLog;
use App\Models\Coupon;

class CouponController
{
    public function index(Request $request): void
    {
        $rows = Coupon::all();
        Response::success(array_map(fn ($r) => [
            'id' => (string) $r['id'],
            'code' => $r['code'],
            'discountType' => $r['discount_type'],
            'value' => (float) $r['value'],
            'usageLimit' => (int) $r['usage_limit'],
            'used' => (int) $r['used'],
            'expiresAt' => gmdate('c', strtotime($r['expires_at'])),
            'status' => $r['status'],
        ], $rows));
    }

    public function store(Request $request): void
    {
        $data = $request->all();
        $validator = Validator::make()
            ->required($data, ['code', 'discountType', 'value', 'usageLimit', 'expiresAt'])
            ->numeric($data, 'value')
            ->numeric($data, 'usageLimit');

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        if (Coupon::findByCode($data['code'])) {
            Response::error('A coupon with this code already exists.', 409);
            return;
        }

        $id = Coupon::create([
            'code' => $data['code'],
            'discount_type' => $data['discountType'],
            'value' => $data['value'],
            'usage_limit' => $data['usageLimit'],
            'expires_at' => $data['expiresAt'],
        ]);

        AuditLog::record($request->param('auth_admin_id'), 'Created coupon', "coupon={$data['code']}", $request->ip());

        Response::success(['id' => (string) $id], 201);
    }
}
