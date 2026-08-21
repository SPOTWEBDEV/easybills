<?php

namespace App\Controllers\Admin;

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use PDO;

class DashboardController
{
    public function stats(Request $request): void
    {
        $db = Database::connection();

        $revenue = $db->query(
            "SELECT COALESCE(SUM(amount + fee), 0) AS total FROM transactions WHERE status = 'success'"
        )->fetch(PDO::FETCH_ASSOC);

        $salesCount = $db->query(
            "SELECT COUNT(*) AS total FROM transactions WHERE status = 'success' AND category != 'wallet-funding'"
        )->fetch(PDO::FETCH_ASSOC);

        $txnCount = $db->query('SELECT COUNT(*) AS total FROM transactions')->fetch(PDO::FETCH_ASSOC);

        $activeUsers = $db->query("SELECT COUNT(*) AS total FROM users WHERE status = 'active'")->fetch(PDO::FETCH_ASSOC);

        Response::success([
            'revenue' => (float) $revenue['total'],
            'sales' => (int) $salesCount['total'],
            'transactions' => (int) $txnCount['total'],
            'activeUsers' => (int) $activeUsers['total'],
        ]);
    }

    public function revenueTrend(Request $request): void
    {
        $db = Database::connection();
        $stmt = $db->query(
            "SELECT DATE_FORMAT(created_at, '%b') AS month, YEAR(created_at) AS yr, MONTH(created_at) AS mo,
                    SUM(amount + fee) AS revenue,
                    COUNT(*) AS sales
             FROM transactions
             WHERE status = 'success' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 MONTH)
             GROUP BY yr, mo
             ORDER BY yr ASC, mo ASC"
        );
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        Response::success(array_map(fn($r) => [
            'month' => $r['month'],
            'revenue' => (float) $r['revenue'],
            'sales' => (int) $r['sales'],
        ], $rows));
    }

    public function topServices(Request $request): void
    {
        $db = Database::connection();
        $stmt = $db->query(
            "SELECT category AS name, COUNT(*) AS count FROM transactions
             WHERE status = 'success' AND category NOT IN ('wallet-funding')
             GROUP BY category ORDER BY count DESC"
        );
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $total = array_sum(array_column($rows, 'count')) ?: 1;
        Response::success(array_map(fn($r) => [
            'name' => ucfirst($r['name']),
            'value' => (int) round(($r['count'] / $total) * 100),
        ], $rows));
    }
}
