<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventTask extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_id',
        'title',
        'description',
        'status',
        'due_date',
    ];

    /* Relationships */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function assignments()
    {
        return $this->hasMany(EventTaskAssignment::class);
    }

    public function comments()
    {
        return $this->hasMany(EventTaskComment::class);
    }

    public function attachments()
    {
        return $this->hasMany(EventTaskAttachment::class);
    }

    public function assignedUsers()
    {
        return $this->belongsToMany(User::class, 'event_task_assignments');
    }
}
