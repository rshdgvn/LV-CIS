<?php

namespace App\Notifications\EventNotifications;

use Illuminate\Notifications\Notification;

class TaskDeleted extends Notification
{
    public function __construct(
        public string $taskTitle,
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
        return [
            'type' => 'task.deleted',
            'title' => 'Task Removed',
            'body' => "The task \"{$this->taskTitle}\" for the event \"{$this->event->title}\" has been removed by {$this->actor->first_name} {$this->actor->last_name}.",
            'task_title' => $this->taskTitle,
            'event_id' => $this->event->id,
            'event_title' => $this->event->title,
            'club_id' => $this->club->id,
            'club_name' => $this->club->name,
            'actor_id' => $this->actor->id,
            'actor_name' => "{$this->actor->first_name} {$this->actor->last_name}",
            'actor_avatar' => $this->actor->avatar,
        ];
    }
}