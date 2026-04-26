<?php

namespace App\Notifications\ClubNotifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MemberRemovedFromClub extends Notification
{
    use Queueable;

    public function __construct(
        public $club,
        public $actor
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'club.member_removed',
            'title' => '🚪 Removed from Club',
            'body' => "You have been removed from {$this->club->name} by {$this->actor->first_name} {$this->actor->last_name}.",
            'club_id' => $this->club->id,
            'club_name' => $this->club->name,
            'actor_id' => $this->actor->id,
            'actor_name' => "{$this->actor->first_name} {$this->actor->last_name}",
            'actor_avatar' => $this->actor->avatar,
        ];
    }
}