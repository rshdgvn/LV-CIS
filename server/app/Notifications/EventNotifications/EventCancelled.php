<?php

namespace App\Notifications\EventNotifications;

use Illuminate\Notifications\Notification;

class EventCancelled extends Notification
{
    public function __construct(
        public string $eventTitle,
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
            'type' => 'event.cancelled',
            'title' => 'Event Cancelled',
            'body' => "The event \"{$this->eventTitle}\" in {$this->club->name} has been cancelled by {$this->actor->first_name} {$this->actor->last_name}.",
            'event_title' => $this->eventTitle,
            'club_id' => $this->club->id,
            'club_name' => $this->club->name,
            'actor_id' => $this->actor->id,
            'actor_name' => "{$this->actor->first_name} {$this->actor->last_name}",
            'actor_avatar' => $this->actor->avatar,
        ];
    }
}