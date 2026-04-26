<?php

namespace App\Notifications\AttendanceNotifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AttendanceSessionCreated extends Notification
{
    use Queueable;

    public function __construct(
        public $session,
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
            'type' => 'attendance.session_created',
            'title' => 'Attendance Session Started',
            'body' => "{$this->actor->first_name} {$this->actor->last_name} opened an attendance session \"{$this->session->title}\" for {$this->club->name} on {$this->session->date}.",
            'session_id' => $this->session->id,
            'session_title' => $this->session->title,
            'club_id' => $this->club->id,
            'club_name' => $this->club->name,
            'actor_id' => $this->actor->id,
            'actor_name' => "{$this->actor->first_name} {$this->actor->last_name}",
            'actor_avatar' => $this->actor->avatar,
            'session_date' => $this->session->date,
            'venue' => $this->session->venue,
        ];
    }
}