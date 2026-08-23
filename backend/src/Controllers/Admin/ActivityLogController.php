<?php

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Models\ActivityLog;

class ActivityLogController
{
    public function index(Request $request): void
    {
        $page = max(1, (int) ($request->query('page') ?? 1));
        $perPage = min(100, max(1, (int) ($request->query('perPage') ?? 20)));

        [$rows, $total] = ActivityLog::paginated($page, $perPage);

        Response::success([
            'data' => array_map(fn ($r) => [
                'id' => (string) $r['id'],
                'user' => $r['user_name'] ?? 'System',
                'action' => $r['action'],
                'device' => $r['device'],
                'timestamp' => gmdate('c', strtotime($r['created_at'])),
            ], $rows),
            'meta' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'totalPages' => (int) ceil($total / $perPage),
            ],
        ]);
    }
}