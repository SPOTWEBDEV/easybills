<?php

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use PDO;

class TransactionController
{
    public function index(Request $request): void
    {
        $db = Database::connection();
        $status = $request->query('status');

        $sql = 'SELECT t.*, u.full_name AS customer_name FROM transactions t
                JOIN users u ON u.id = t.user_id';
        $params = [];
        if ($status && $status !== 'all') {
            $sql .= ' WHERE t.status = :status';
            $params['status'] = $status;
        }
        $sql .= ' ORDER BY t.created_at DESC LIMIT 200';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::success(array_map(fn ($r) => [
            'id' => (string) $r['id'],
            'reference' => $r['reference'],
            'customer' => $r['customer_name'],
            'service' => $r['title'],
            'amount' => (float) $r['amount'],
            'status' => $r['status'],
            'date' => gmdate('c', strtotime($r['created_at'])),
        ], $rows));
    }
}
