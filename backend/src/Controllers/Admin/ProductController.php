<?php

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use App\Models\AuditLog;
use PDO;

class ProductController
{
    public function index(Request $request): void
    {
        $db = Database::connection();
        $stmt = $db->query('SELECT * FROM data_plans ORDER BY provider_id, price ASC');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success(array_map(fn ($r) => [
            'id' => $r['id'],
            'name' => $r['label'],
            'category' => 'Data',
            'provider' => $r['provider_id'],
            'costPrice' => (float) $r['cost_price'],
            'sellPrice' => (float) $r['price'],
            'status' => $r['status'],
        ], $rows));
    }

    public function toggleStatus(Request $request): void
    {
        $id = $request->param('id');
        $db = Database::connection();

        $stmt = $db->prepare('SELECT status FROM data_plans WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            Response::error('Product not found.', 404);
            return;
        }

        $newStatus = $row['status'] === 'active' ? 'inactive' : 'active';
        $update = $db->prepare('UPDATE data_plans SET status = :status WHERE id = :id');
        $update->execute(['status' => $newStatus, 'id' => $id]);

        AuditLog::record($request->param('auth_admin_id'), 'Toggled product status', "product_id={$id} -> {$newStatus}", $request->ip());

        Response::success(['status' => $newStatus]);
    }
}
