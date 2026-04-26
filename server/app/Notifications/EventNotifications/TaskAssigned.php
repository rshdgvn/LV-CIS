<?php

namespace App\Notifications\EventNotifications;

use Illuminate\Notifications\Notification;

class TaskAssigned extends Notification
{
    public function __construct(
        public $task,
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
        $due = $this->task->due_date
            ? \Carbon\Carbon::parse($this->task->due_date)->format('F j, Y')
            : 'No deadline';

        return [
            'type' => 'task.assigned',
            'title' => 'New Task Assigned to You',
            'body' => "{$this->actor->first_name} {$this->actor->last_name} assigned you a task: \"{$this->task->title}\" for the event \"{$this->event->title}\". Due: {$due}.",
            'task_id' => $this->task->id,
            'task_title' => $this->task->title,
            'task_due' => $due,
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