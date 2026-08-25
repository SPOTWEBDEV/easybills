<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Validator;
use App\Core\WebPushClient;
use App\Models\PushSubscription;

class PushController
{
    public function vapidPublicKey(Request $request): void
    {
        $client = new WebPushClient();
        $key = $client->publicKey();

        if ($key === '') {
            Response::error('Push notifications are not configured on this server yet.', 503);
            return;
        }

        Response::success(['publicKey' => $key]);
    }

    public function subscribe(Request $request): void
    {
        $userId = (int) $request->param('auth_user_id');
        $data = $request->all();

        $validator = Validator::make()->required($data, ['endpoint', 'p256dh', 'auth']);
        if ($validator->fails()) {
            Response::error($validator->firstError(), 422);
            return;
        }

        PushSubscription::save(
            $userId,
            $data['endpoint'],
            $data['p256dh'],
            $data['auth'],
            $_SERVER['HTTP_USER_AGENT'] ?? null
        );

        Response::success(['success' => true]);
    }

    public function unsubscribe(Request $request): void
    {
        $data = $request->all();
        if (!empty($data['endpoint'])) {
            PushSubscription::remove($data['endpoint']);
        }
        Response::success(['success' => true]);
    }
}