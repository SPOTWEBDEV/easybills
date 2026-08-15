<?php

namespace App\Core;

class Router
{
    private array $routes = [];
    /** @var callable[] */
    private array $globalMiddleware = [];

    public function middleware(callable $middleware): void
    {
        $this->globalMiddleware[] = $middleware;
    }

    public function get(string $path, callable $handler, array $middleware = []): void
    {
        $this->add('GET', $path, $handler, $middleware);
    }

    public function post(string $path, callable $handler, array $middleware = []): void
    {
        $this->add('POST', $path, $handler, $middleware);
    }

    public function put(string $path, callable $handler, array $middleware = []): void
    {
        $this->add('PUT', $path, $handler, $middleware);
    }

    public function delete(string $path, callable $handler, array $middleware = []): void
    {
        $this->add('DELETE', $path, $handler, $middleware);
    }

    private function add(string $method, string $path, callable $handler, array $middleware): void
    {
        $this->routes[] = compact('method', 'path', 'handler', 'middleware');
    }

    public function dispatch(Request $request): void
    {
        foreach ($this->globalMiddleware as $mw) {
            $mw($request);
        }

        $method = $request->method();
        $path = rtrim($request->path(), '/');
        if ($path === '') {
            $path = '/';
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', $route['path']);
            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $path, $matches)) {
                $params = array_filter($matches, fn ($k) => !is_int($k), ARRAY_FILTER_USE_KEY);
                $request->params = $params;

                foreach ($route['middleware'] as $mw) {
                    $mw($request);
                }

                ($route['handler'])($request);
                return;
            }
        }

        Response::error('Route not found.', 404, ['path' => $path, 'method' => $method]);
    }
}
