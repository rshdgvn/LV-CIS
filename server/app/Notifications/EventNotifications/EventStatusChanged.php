<?php

namespace App\Notifications\EventNotifications;

use Illuminate\Notifications\Notification;

class EventStatusChanged extends Notification
{
    public function __construct(
        public $event,
        public $club,
        public $actor,
        public string $newStatus
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $statusMap = [
            'ongoing' => ['emoji' => '🟢', 'label' => 'Ongoing', 'body' => "The event \"{$this->event->title}\" is now **ongoing**! Head over to the venue."],
            'completed' => ['emoji' => '🏁', 'label' => 'Completed', 'body' => "The event \"{$this->event->title}\" has been marked as **completed**. Great participation!"],
            'upcoming' => ['emoji' => '📅', 'label' => 'Upcoming', 'body' => "The event \"{$this->event->title}\" has been rescheduled and is now **upcoming**."],
        ];

        $info = $statusMap[$this->newStatus] ?? ['emoji' => 'ℹ️', 'label' => $this->newStatus, 'body' => "Event status updated to {$this->newStatus}."];

        return [
            'type' => 'event.status_changed',
            'title' => "{$info['emoji']} Event {$info['label']}",
            'body' => $info['body'],
            'event_id' => $this->event->id,
            'event_title' => $this->event->title,
            'new_status' => $this->newStatus,
            'club_id' => $this->club->id,
            'club_name' => $this->club->name,
            'actor_id' => $this->actor->id,
            'actor_name' => "{$this->actor->first_name} {$this->actor->last_name}",
            'actor_avatar' => $this->actor->avatar,
        ];
    }
}