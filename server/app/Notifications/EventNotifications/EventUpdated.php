<?php

namespace App\Notifications\EventNotifications;

use Illuminate\Notifications\Notification;

class EventUpdated extends Notification
{
    public function __construct(
        public $event,
        public $club,
        public $actor
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $date = optional($this->event->detail)->event_date
            ? \Carbon\Carbon::parse($this->event->detail->event_date)->format('F j, Y')
            : 'TBA';

        return [
            'type' => 'event.updated',
            'title' => '📝 Event Updated',
            'body' => "Heads up! The event \"{$this->event->title}\" in {$this->club->name} has been updated by {$this->actor->first_name} {$this->actor->last_name}. Check the latest details.",
            'event_id' => $this->event->id,
            'event_title' => $this->event->title,
            'event_date' => $date,
            'club_id' => $this->club->id,
            'club_name' => $this->club->name,
            'actor_id' => $this->actor->id,
            'actor_name' => "{$this->actor->first_name} {$this->actor->last_name}",
            'actor_avatar' => $this->actor->avatar,
        ];
    }
}