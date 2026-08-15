<?php

namespace App\Core;

class Response
{
    public static function json(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    public static function success(mixed $data = [], int $status = 200): void
    {
        if (is_array($data) && array_is_list($data)) {
            self::json(['data' => $data], $status);
            return;
        }
        if (is_array($data)) {
            self::json($data, $status);
            return;
        }
        self::json(['data' => $data], $status);
    }

    public static function error(string $message, int $status = 400, array $extra = []): void
    {
        self::json(array_merge(['error' => $message], $extra), $status);
    }

    public static function csv(string $filename, array $rows): void
    {
        http_response_code(200);
        header('Content-Type: text/csv; charset=utf-8');
        header("Content-Disposition: attachment; filename=\"{$filename}\"");
        $out = fopen('php://output', 'w');
        foreach ($rows as $row) {
            fputcsv($out, $row);
        }
        fclose($out);
    }
}
