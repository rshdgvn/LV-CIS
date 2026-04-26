<?php

namespace App\Notifications\EventNotifications;

use Illuminate\Notifications\Notification;

class TaskStatusUpdated extends Notification
{
    public function __construct(
        public $task,
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
            'pending' => ['emoji' => '⏳', 'label' => 'Pending'],
            'in_progress' => ['emoji' => '🔄', 'label' => 'In Progress'],
            'completed' => ['emoji' => '✅', 'label' => 'Completed'],
        ];

        $info = $statusMap[$this->newStatus] ?? ['emoji' => 'ℹ️', 'label' => $this->newStatus];

        return [
            'type' => 'task.status_updated',
            'title' => "Task Status: {$info['label']}",
            'body' => "The task \"{$this->task->title}\" for \"{$this->event->title}\" was updated to **{$info['label']}** by {$this->actor->first_name} {$this->actor->last_name}.",
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'new_status' => $this->newStatus,
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