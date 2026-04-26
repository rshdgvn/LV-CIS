<?php

namespace App\Notifications\ClubNotifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MemberRoleChanged extends Notification
{
    use Queueable;

    public function __construct(
        public $club,
        public $actor,
        public string $newRole,
        public ?string $officerTitle = null
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $roleLabel = $this->newRole === 'officer'
            ? ($this->officerTitle ? "Officer ({$this->officerTitle})" : 'Officer')
            : 'Member';

        return [
            'type' => 'club.role_changed',
            'title' => '🏅 Your Role Has Been Updated',
            'body' => "{$this->actor->first_name} {$this->actor->last_name} changed your role in {$this->club->name} to {$roleLabel}.",
            'club_id' => $this->club->id,
            'club_name' => $this->club->name,
            'new_role' => $this->newRole,
            'officer_title' => $this->officerTitle,
            'actor_id' => $this->actor->id,
            'actor_name' => "{$this->actor->first_name} {$this->actor->last_name}",
            'actor_avatar' => $this->actor->avatar,
        ];
    }
}