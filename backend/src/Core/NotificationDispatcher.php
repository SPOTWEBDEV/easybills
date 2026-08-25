<?php

namespace App\Core;

use App\Models\Notification;
use App\Models\PushSubscription;


class NotificationDispatcher
{
    /**
     * Records a real notification for the user AND best-effort sends a push
     * to every device they've subscribed on. Push failures never throw —
     * a user without push enabled (or a mis-configured server) still gets
     * the in-app notification, which is the part that's guaranteed to work.
     */
    public static function notify(int $userId, string $title, string $body, string $type = 'general'): void
    {
        Notification::create($userId, $title, $body, $type);

        try {
            $client = new WebPushClient();
            if ($client->publicKey() === '') {
                return; // push not configured — silently skip, in-app notification already saved
            }

            foreach (PushSubscription::allForUser($userId) as $sub) {
                try {
                    $result = $client->send($sub, $title, $body, ['type' => $type]);
                    if ($result['shouldRemove']) {
                        PushSubscription::removeDead($sub['endpoint']);
                    }
                } catch (\Throwable $e) {
                    error_log('Push send failed for subscription ' . $sub['id'] . ': ' . $e->getMessage());
                }
            }
        } catch (\Throwable $e) {
            error_log('NotificationDispatcher push dispatch error: ' . $e->getMessage());
        }
    }
}