<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ExpoService
{
    public static function sendPushNotification($user, $title, $body)
    {
        if (!$user->expo_push_token) {
            return; 
        }

        Http::post('https://exp.host/--/api/v2/push/send', [
            'to' => $user->expo_push_token,
            'title' => $title,
            'body' => $body,
            'sound' => 'default',
            'data' => [
                'screen' => 'NotificationsScreen',
                'timestamp' => now()->toIso8601String()
            ], 
        ]);
    }
}