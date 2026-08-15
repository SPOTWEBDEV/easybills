<?php

declare(strict_types=1);

// ---------------------------------------------------------------------
// Custom PSR-4-ish autoloader for the App\ namespace — no Composer
// required. Maps App\Foo\Bar -> src/Foo/Bar.php
// ---------------------------------------------------------------------
spl_autoload_register(function (string $class) {
    $prefix = 'App\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }
    $relative = substr($class, strlen($prefix));
    $path = dirname(__DIR__) . '/src/' . str_replace('\\', '/', $relative) . '.php';
    if (file_exists($path)) {
        require $path;
    }
});

use App\Core\Env;
use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Middleware\CorsMiddleware;

Env::load(dirname(__DIR__) . '/.env');

date_default_timezone_set((string) Env::get('APP_TIMEZONE', 'Africa/Lagos'));

$debug = (bool) Env::get('APP_DEBUG', false);
if ($debug) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
}

set_exception_handler(function (Throwable $e) use ($debug) {
    error_log($e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    Response::error('Something went wrong.', 500, $debug ? [
        'detail' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ] : []);
});

$router = new Router();
$router->middleware(new CorsMiddleware());

require dirname(__DIR__) . '/src/routes.php';

$request = new Request();
$router->dispatch($request);
