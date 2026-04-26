<?php

namespace App\Notifications\AttendanceNotifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AttendanceMarked extends Notification
{
    use Queueable;

    public function __construct(
        public $session,
        public $club,
        public $actor,
        public string $status
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $statusMessages = [
            'present' => ['emoji' => '✅', 'label' => 'Present', 'body' => "You were marked as **present** in the \"{$this->session->title}\" session of {$this->club->name}. Keep it up!"],
            'absent'  => ['emoji' => '❌', 'label' => 'Absent', 'body' => "You were marked as **absent** in the \"{$this->session->title}\" session of {$this->club->name}. If this is a mistake, please contact your officer."],
            'late'    => ['emoji' => '⏰', 'label' => 'Late', 'body' => "You were marked as **late** in the \"{$this->session->title}\" session of {$this->club->name}. Try to be on time next time!"],
            'excuse'  => ['emoji' => '📝', 'label' => 'Excused', 'body' => "Your absence in the \"{$this->session->title}\" session of {$this->club->name} has been marked as **excused**."],
        ];

        $info = $statusMessages[$this->status] ?? [
            'emoji' => 'ℹ️',
            'label' => ucfirst($this->status),
            'body' => "Your attendance status was updated to {$this->status} for \"{$this->session->title}\".",
        ];

        return [
            'type' => 'attendance.marked',
            'title' => "Attendance: {$info['label']}",
            'body' => $info['body'],
            'session_id' => $this->session->id,
            'session_title' => $this->session->title,
            'club_id' => $this->club->id,
            'club_name' => $this->club->name,
            'status' => $this->status,
            'actor_id' => $this->actor->id,
            'actor_name' => "{$this->actor->first_name} {$this->actor->last_name}",
            'actor_avatar' => $this->actor->avatar,
            'session_date' => $this->session->date,
        ];
    }
}