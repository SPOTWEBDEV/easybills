<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class BlogPost
{
    /** Admin: every post, paginated, newest first. */
    public static function paginated(int $page, int $perPage): array
    {
        $db = Database::connection();
        $offset = ($page - 1) * $perPage;

        $total = (int) $db->query('SELECT COUNT(*) FROM blog_posts')->fetchColumn();

        $stmt = $db->prepare('SELECT * FROM blog_posts ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue('limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [$stmt->fetchAll(PDO::FETCH_ASSOC), $total];
    }

    /** Public: published posts only, paginated, newest first. */
    public static function publishedPaginated(int $page, int $perPage): array
    {
        $db = Database::connection();
        $offset = ($page - 1) * $perPage;

        $total = (int) $db->query("SELECT COUNT(*) FROM blog_posts WHERE status = 'published'")->fetchColumn();

        $stmt = $db->prepare(
            "SELECT * FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT :limit OFFSET :offset"
        );
        $stmt->bindValue('limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue('offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [$stmt->fetchAll(PDO::FETCH_ASSOC), $total];
    }

    public static function find(int $id): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT * FROM blog_posts WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function findPublishedBySlug(string $slug): ?array
    {
        $db = Database::connection();
        $stmt = $db->prepare("SELECT * FROM blog_posts WHERE slug = :slug AND status = 'published' LIMIT 1");
        $stmt->execute(['slug' => $slug]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public static function incrementViews(int $id): void
    {
        $db = Database::connection();
        $stmt = $db->prepare('UPDATE blog_posts SET views = views + 1 WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }

    private static function slugify(string $title): string
    {
        $base = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $title), '-'));
        $slug = $base;
        $db = Database::connection();
        $suffix = 1;
        while (self::slugExists($slug)) {
            $suffix++;
            $slug = "{$base}-{$suffix}";
        }
        return $slug;
    }

    private static function slugExists(string $slug): bool
    {
        $db = Database::connection();
        $stmt = $db->prepare('SELECT 1 FROM blog_posts WHERE slug = :slug LIMIT 1');
        $stmt->execute(['slug' => $slug]);
        return (bool) $stmt->fetchColumn();
    }

    public static function create(array $data): int
    {
        $db = Database::connection();
        $status = $data['status'] ?? 'draft';
        $stmt = $db->prepare(
            'INSERT INTO blog_posts (title, slug, author, content, status, views, published_at, created_at, updated_at)
             VALUES (:title, :slug, :author, :content, :status, 0, :published_at, NOW(), NOW())'
        );
        $stmt->execute([
            'title' => $data['title'],
            'slug' => self::slugify($data['title']),
            'author' => $data['author'],
            'content' => $data['content'] ?? '',
            'status' => $status,
            'published_at' => $status === 'published' ? date('Y-m-d H:i:s') : null,
        ]);
        return (int) $db->lastInsertId();
    }

    public static function update(int $id, array $data): void
    {
        $db = Database::connection();
        $current = self::find($id);
        if (!$current) {
            return;
        }

        $status = $data['status'] ?? $current['status'];
        $publishedAt = $current['published_at'];
        if ($status === 'published' && !$publishedAt) {
            $publishedAt = date('Y-m-d H:i:s');
        }

        $stmt = $db->prepare(
            'UPDATE blog_posts SET title = :title, author = :author, content = :content, status = :status,
                published_at = :published_at, updated_at = NOW()
             WHERE id = :id'
        );
        $stmt->execute([
            'title' => $data['title'] ?? $current['title'],
            'author' => $data['author'] ?? $current['author'],
            'content' => $data['content'] ?? $current['content'],
            'status' => $status,
            'published_at' => $publishedAt,
            'id' => $id,
        ]);
    }

    public static function toggleStatus(int $id): string
    {
        $db = Database::connection();
        $current = self::find($id);
        $newStatus = ($current['status'] ?? 'draft') === 'published' ? 'draft' : 'published';

        $stmt = $db->prepare(
            'UPDATE blog_posts SET status = :status, published_at = IF(:status2 = "published" AND published_at IS NULL, NOW(), published_at), updated_at = NOW()
             WHERE id = :id'
        );
        $stmt->execute(['status' => $newStatus, 'status2' => $newStatus, 'id' => $id]);
        return $newStatus;
    }

    public static function delete(int $id): void
    {
        $db = Database::connection();
        $stmt = $db->prepare('DELETE FROM blog_posts WHERE id = :id');
        $stmt->execute(['id' => $id]);
    }

    public static function excerpt(string $content, int $length = 160): string
    {
        $plain = trim(preg_replace('/\s+/', ' ', strip_tags($content)));
        if (mb_strlen($plain) <= $length) {
            return $plain;
        }
        return mb_substr($plain, 0, $length) . '…';
    }
}