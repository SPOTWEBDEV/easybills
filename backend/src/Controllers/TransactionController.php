<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Transaction;

class TransactionController
{
    public function index(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $filters = [
            'status' => $request->query('status'),
            'category' => $request->query('category'),
            'query' => $request->query('query'),
        ];
        $limit = (int) ($request->query('limit') ?? 50);
        $offset = (int) ($request->query('offset') ?? 0);

        $rows = Transaction::listForUser($userId, $filters, $limit, $offset);
        Response::success(array_map([Transaction::class, 'toPublicArray'], $rows));
    }

    public function show(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $id = $request->param('id');

        $row = Transaction::findByReferenceForUser($id, $userId);
        if (!$row) {
            Response::error('Transaction not found.', 404);
            return;
        }
        Response::success(Transaction::toPublicArray($row));
    }

    public function summary(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        Response::success(Transaction::summaryForUser($userId));
    }
}
