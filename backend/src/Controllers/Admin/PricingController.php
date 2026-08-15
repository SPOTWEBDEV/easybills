<?php

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\AuditLog;
use App\Models\PricingRule;

class PricingController
{
    public function index(Request $request): void
    {
        $rows = PricingRule::all();
        Response::success(array_map([PricingRule::class, 'toPublicArray'], $rows));
    }

    public function update(Request $request): void
    {
        $id = (int) $request->param('id');
        $data = $request->all();

        $validator = Validator::make()
            ->required($data, ['marginType', 'marginValue'])
            ->numeric($data, 'marginValue');

        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        if (!in_array($data['marginType'], ['fixed', 'percentage'], true)) {
            Response::error('marginType must be "fixed" or "percentage".', 422);
            return;
        }

        PricingRule::update($id, $data['marginType'], (float) $data['marginValue']);

        AuditLog::record(
            $request->param('auth_admin_id'),
            'Updated pricing rule',
            "pricing_rule_id={$id} type={$data['marginType']} value={$data['marginValue']}",
            $request->ip()
        );

        Response::success(['success' => true]);
    }
}
