<?php

namespace App\Middleware;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;

class AdminMiddleware
{
    public function __invoke(Request $request): void
    {
        $admin = Auth::adminFromRequest($request);
        if (!$admin) {
            Response::error('Unauthenticated admin session.', 401);
            exit;
        }
        $request->params['auth_admin_id'] = (string) $admin['id'];
        $request->params['auth_admin_role'] = $admin['role'];
    }
}
