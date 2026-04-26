<?php

namespace App\Notifications\EventNotifications;

use Illuminate\Notifications\Notification;

class EventCreated extends Notification
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

        $venue = optional($this->event->detail)->venue ?? 'TBA';

        return [
            'type' => 'event.created',
            'title' => '📅 New Event in ' . $this->club->name,
            'body' => "{$this->actor->first_name} {$this->actor->last_name} created a new event: \"{$this->event->title}\" on {$date} at {$venue}. Don't miss it!",
            'event_id' => $this->event->id,
            'event_title' => $this->event->title,
            'event_date' => $date,
            'venue' => $venue,
            'club_id' => $this->club->id,
            'club_name' => $this->club->name,
            'actor_id' => $this->actor->id,
            'actor_name' => "{$this->actor->first_name} {$this->actor->last_name}",
            'actor_avatar' => $this->actor->avatar,
        ];
    }
}