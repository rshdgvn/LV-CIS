<?php

namespace App\Notifications\ClubNotifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Channels\ExpoChannel;

class MembershipApproved extends Notification
{
    use Queueable;

    public function __construct(
        public $club,
        public $actor
    ) {}

    public function via($notifiable): array
    {
        return ['database', ExpoChannel::class];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'club.membership_approved',
            'title' => 'Membership Approved!',
            'body' => "Great news! {$this->actor->first_name} {$this->actor->last_name} approved your request to join {$this->club->name}.",
            'club_id' => $this->club->id,
            'club_name' => $this->club->name,
            'actor_id' => $this->actor->id,
            'actor_name' => "{$this->actor->first_name} {$this->actor->last_name}",
            'actor_avatar' => $this->actor->avatar,
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