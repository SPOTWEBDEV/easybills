<?php

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\AdminNavItem;
use App\Models\AuditLog;

class NavItemController
{
    /**
     * Returns EVERY item (visible + hidden). The frontend sidebar itself
     * filters to visible=true when rendering; the nav-settings management
     * page uses the full unfiltered list so admins can toggle hidden ones
     * back on.
     */
    public function index(Request $request): void
    {
        $rows = AdminNavItem::all();
        Response::success(array_map([AdminNavItem::class, 'toPublicArray'], $rows));
    }

    public function update(Request $request): void
    {
        $id = (int) $request->param('id');
        $data = $request->all();

        $validator = Validator::make()->required($data, ['visible']);
        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $visible = (bool) $data['visible'];
        AdminNavItem::setVisible($id, $visible);

        AuditLog::record(
            (string) $request->param('auth_admin_id'),
            $visible ? 'Showed admin nav item' : 'Hid admin nav item',
            "nav_item_id={$id}",
            $request->ip()
        );

        Response::success(['success' => true]);
    }
}