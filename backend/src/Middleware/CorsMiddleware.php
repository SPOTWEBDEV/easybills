<?php

namespace App\Middleware;

use App\Core\Env;
use App\Core\Request;

class CorsMiddleware
{
    public function __invoke(Request $request): void
    {
        $allowed = array_map('trim', explode(',', (string) Env::get('CORS_ALLOWED_ORIGINS', '*')));
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array('*', $allowed, true)) {
            header('Access-Control-Allow-Origin: *');
        } elseif (in_array($origin, $allowed, true)) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Vary: Origin');
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');

        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
