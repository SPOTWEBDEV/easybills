<?php

namespace App\Controllers\Admin;

use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Models\AuditLog;
use App\Models\BlogPost;

class BlogController
{
    public function index(Request $request): void
    {
        $page = max(1, (int) ($request->query('page') ?? 1));
        $perPage = min(100, max(1, (int) ($request->query('perPage') ?? 20)));

        [$rows, $total] = BlogPost::paginated($page, $perPage);

        Response::success([
            'data' => array_map(fn ($r) => [
                'id' => (string) $r['id'],
                'title' => $r['title'],
                'slug' => $r['slug'],
                'author' => $r['author'],
                'content' => $r['content'],
                'status' => $r['status'],
                'views' => (int) $r['views'],
                'publishedAt' => $r['published_at'] ? gmdate('c', strtotime($r['published_at'])) : null,
                'updatedAt' => gmdate('c', strtotime($r['updated_at'])),
            ], $rows),
            'meta' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'totalPages' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    public function store(Request $request): void
    {
        $data = $request->all();
        $validator = Validator::make()->required($data, ['title', 'author']);
        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        $id = BlogPost::create($data);
        AuditLog::record((string) $request->param('auth_admin_id'), 'Created blog post', $data['title'], $request->ip());

        Response::success(['id' => (string) $id], 201);
    }

    public function update(Request $request): void
    {
        $id = (int) $request->param('id');
        if (!BlogPost::find($id)) {
            Response::error('Post not found.', 404);
            return;
        }

        $data = $request->all();
        $validator = Validator::make()->required($data, ['title', 'author']);
        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        BlogPost::update($id, $data);
        AuditLog::record((string) $request->param('auth_admin_id'), 'Updated blog post', "post_id={$id}", $request->ip());

        Response::success(['success' => true]);
    }

    public function toggleStatus(Request $request): void
    {
        $id = (int) $request->param('id');
        if (!BlogPost::find($id)) {
            Response::error('Post not found.', 404);
            return;
        }

        $newStatus = BlogPost::toggleStatus($id);
        AuditLog::record((string) $request->param('auth_admin_id'), 'Toggled blog post status', "post_id={$id} -> {$newStatus}", $request->ip());

        Response::success(['status' => $newStatus]);
    }

    public function destroy(Request $request): void
    {
        $id = (int) $request->param('id');
        if (!BlogPost::find($id)) {
            Response::error('Post not found.', 404);
            return;
        }

        BlogPost::delete($id);
        AuditLog::record((string) $request->param('auth_admin_id'), 'Deleted blog post', "post_id={$id}", $request->ip());

        Response::success(['success' => true]);
    }
}