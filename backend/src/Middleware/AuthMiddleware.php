<?php

namespace App\Middleware;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;

class AuthMiddleware
{
    public function __invoke(Request $request): void
    {
        $userId = Auth::userIdFromRequest($request);
        if (!$userId) {
            Response::error('Unauthenticated. Please log in again.', 401);
            exit;
        }
        $request->params['auth_user_id'] = (string) $userId;
    }
}
