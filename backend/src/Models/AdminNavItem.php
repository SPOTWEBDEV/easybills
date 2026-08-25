<?php

namespace App\Models;

use App\Core\Database;
use PDO;

class AdminNavItem
{
    /** Every item, including hidden ones — used by the nav-settings management page. */
    public static function all(): array
    {
        $db = Database::connection();
        $stmt = $db->query('SELECT * FROM admin_nav_items ORDER BY group_label, sort_order ASC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Only visible items, in display order — used to render the real sidebar. */
    public static function visible(): array
    {
        $db = Database::connection();
        $stmt = $db->query('SELECT * FROM admin_nav_items WHERE visible = 1 ORDER BY group_label, sort_order ASC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function setVisible(int $id, bool $visible): void
    {
        $db = Database::connection();
        $stmt = $db->prepare('UPDATE admin_nav_items SET visible = :visible WHERE id = :id');
        $stmt->execute(['visible' => $visible ? 1 : 0, 'id' => $id]);
    }

    public static function toPublicArray(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'sectionKey' => $row['section_key'],
            'label' => $row['label'],
            'icon' => $row['icon'],
            'href' => $row['href'],
            'group' => $row['group_label'],
            'sortOrder' => (int) $row['sort_order'],
            'visible' => (bool) $row['visible'],
        ];
    }
}