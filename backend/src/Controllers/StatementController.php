<?php

namespace App\Controllers;

use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use PDO;

class StatementController
{
    public function csv(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $from = $request->query('from', date('Y-m-d', strtotime('-30 days')));
        $to = $request->query('to', date('Y-m-d'));

        $db = Database::connection();
        $stmt = $db->prepare(
            'SELECT * FROM transactions
             WHERE user_id = :user_id AND DATE(created_at) BETWEEN :from AND :to
             ORDER BY created_at DESC'
        );
        $stmt->execute(['user_id' => $userId, 'from' => $from, 'to' => $to]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $csvRows = [['Date', 'Reference', 'Title', 'Category', 'Recipient', 'Amount', 'Fee', 'Status']];
        foreach ($rows as $row) {
            $csvRows[] = [
                $row['created_at'],
                $row['reference'],
                $row['title'],
                $row['category'],
                $row['recipient'],
                $row['amount'],
                $row['fee'],
                $row['status'],
            ];
        }

        Response::csv("easybills-statement-{$from}-to-{$to}.csv", $csvRows);
    }
}
