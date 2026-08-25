<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\Notification;

class NotificationController
{
    public function index(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $page = max(1, (int) ($request->query('page') ?? 1));
        $perPage = min(50, max(1, (int) ($request->query('perPage') ?? 20)));

        [$rows, $total] = Notification::paginatedForUser($userId, $page, $perPage);

        Response::success([
            'data' => array_map([Notification::class, 'toPublicArray'], $rows),
            'meta' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'totalPages' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    public function unreadCount(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        Response::success(['count' => Notification::unreadCountForUser($userId)]);
    }

    public function markRead(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $id = (int) $request->param('id');
        $updated = Notification::markRead($id, $userId);

        if (!$updated) {
            Response::error('Notification not found.', 404);
            return;
        }
        Response::success(['success' => true]);
    }

    public function markAllRead(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $count = Notification::markAllRead($userId);
        Response::success(['success' => true, 'updated' => $count]);
    }
}