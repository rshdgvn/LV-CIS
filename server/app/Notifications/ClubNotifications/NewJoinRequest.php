<?php

namespace App\Notifications\ClubNotifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\ExpoChannel;

class NewJoinRequest extends Notification
{
    use Queueable;

    public function __construct(
        public $club,
        public $requester
    ) {}

    public function via($notifiable): array
    {
        return ['database', ExpoChannel::class];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'club.new_join_request',
            'title' => 'New Join Request',
            'body' => "{$this->requester->first_name} {$this->requester->last_name} wants to join {$this->club->name}. Review their request.",
            'club_id' => $this->club->id,
            'club_name' => $this->club->name,
            'actor_id' => $this->requester->id,
            'actor_name' => "{$this->requester->first_name} {$this->requester->last_name}",
            'actor_avatar' => $this->requester->avatar,
        ];
    }

    public function toExpo($notifiable): array
    {
        $data = $this->toArray($notifiable);

        return [
            'title' => $data['title'],
            'body' => str_replace('**', '', $data['body']),
            'data' => [
                'club_id' => $this->club->id,
                'type' => $data['type']
            ]
        ];
    }
}