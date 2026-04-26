<?php

namespace App\Notifications\AttendanceNotifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ActivityStatusChanged extends Notification
{
    use Queueable;

    public function __construct(
        public $club,
        public string $newStatus
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        if ($this->newStatus === 'inactive') {
            return [
                'type' => 'attendance.activity_inactive',
                'title' => 'Activity Warning',
                'body' => "You've been marked as **inactive** in {$this->club->name} due to 3 consecutive absences. Please attend your next session to stay active!",
                'club_id' => $this->club->id,
                'club_name' => $this->club->name,
                'new_status' => $this->newStatus,
                'actor_id' => null,
                'actor_name' => 'System',
                'actor_avatar' => null,
            ];
        }

        return [
            'type' => 'attendance.activity_active',
            'title' => '🌟 You\'re Active Again!',
            'body' => "Your activity status in {$this->club->name} has been updated to **active**. Great job showing up!",
            'club_id' => $this->club->id,
            'club_name' => $this->club->name,
            'new_status' => $this->newStatus,
            'actor_id' => null,
            'actor_name' => 'System',
            'actor_avatar' => null,
        ];
    }
}