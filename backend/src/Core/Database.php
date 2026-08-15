<?php

namespace App\Core;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $instance = null;

    public static function connection(): PDO
    {
        if (self::$instance === null) {
            $host = Env::get('DB_HOST', '127.0.0.1');
            $port = Env::get('DB_PORT', '3306');
            $db   = Env::get('DB_DATABASE', 'easybills');
            $user = Env::get('DB_USERNAME', 'root');
            $pass = Env::get('DB_PASSWORD', '');

            $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";

            try {
                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $e) {
                Response::json([
                    'error' => 'Database connection failed.',
                    'detail' => Env::get('APP_DEBUG', false) ? $e->getMessage() : null,
                ], 500);
                exit;
            }
        }

        return self::$instance;
    }
}
