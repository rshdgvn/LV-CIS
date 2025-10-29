<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventTaskComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_task_id',
        'club_membership_id',
        'comment',
    ];

    public function task()
    {
        return $this->belongsTo(EventTask::class, 'event_task_id');
    }

    public function clubMembership()
    {
        return $this->belongsTo(ClubMembership::class, 'club_membership_id');
    }
}
