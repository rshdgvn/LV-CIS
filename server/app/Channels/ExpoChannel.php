<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoChannel
{
  public function send($notifiable, Notification $notification)
  {
    if (!method_exists($notification, 'toExpo')) {
      return;
    }

    $message = $notification->toExpo($notifiable);

    if (!$notifiable->expo_push_token || empty($message)) {
      \Log::warning('ExpoChannel: skipped', [
        'token' => $notifiable->expo_push_token,
        'message_empty' => empty($message)
      ]);
      return;
    }

    $response = Http::post('https://exp.host/--/api/v2/push/send', [
      'to' => $notifiable->expo_push_token,
      'title' => $message['title'],
      'body' => $message['body'],
      'sound' => 'default',
      'data' => [
        'url' => '/profile/notifications',
        ...$message['data']
      ]
    ]);

    Log::info('ExpoChannel response', [
      'status' => $response->status(),
      'body' => $response->json()
    ]);
  }
}
