<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Models\BlogPost;

class BlogController
{
    public function index(Request $request): void
    {
        $page = max(1, (int) ($request->query('page') ?? 1));
        $perPage = min(50, max(1, (int) ($request->query('perPage') ?? 9)));

        [$rows, $total] = BlogPost::publishedPaginated($page, $perPage);

        Response::success([
            'data' => array_map(fn ($r) => [
                'id' => (string) $r['id'],
                'title' => $r['title'],
                'slug' => $r['slug'],
                'author' => $r['author'],
                'excerpt' => BlogPost::excerpt($r['content'] ?? ''),
                'publishedAt' => $r['published_at'] ? gmdate('c', strtotime($r['published_at'])) : null,
                'views' => (int) $r['views'],
            ], $rows),
            'meta' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'totalPages' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    public function show(Request $request): void
    {
        $slug = (string) $request->param('slug');
        $post = BlogPost::findPublishedBySlug($slug);

        if (!$post) {
            Response::error('This post could not be found.', 404);
            return;
        }

        BlogPost::incrementViews((int) $post['id']);

        Response::success([
            'id' => (string) $post['id'],
            'title' => $post['title'],
            'slug' => $post['slug'],
            'author' => $post['author'],
            'content' => $post['content'],
            'publishedAt' => $post['published_at'] ? gmdate('c', strtotime($post['published_at'])) : null,
            'views' => (int) $post['views'] + 1,
        ]);
    }
}