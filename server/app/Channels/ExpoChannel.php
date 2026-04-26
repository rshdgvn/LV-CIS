<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;

class ExpoChannel
{
    public function send($notifiable, Notification $notification)
    {
        if (!method_exists($notification, 'toExpo')) {
            return;
        }

        $message = $notification->toExpo($notifiable);

        if (!$notifiable->expo_push_token || empty($message)) {
            return;
        }

        Http::post('https://exp.host/--/api/v2/push/send', [
            'to' => $notifiable->expo_push_token,
            'title' => $message['title'],
            'body' => $message['body'],
            'sound' => 'default',
            'data' => [
                'url' => '/profile/notifications',
                'message' => $message['data']
            ]
        ]);
    }
}
