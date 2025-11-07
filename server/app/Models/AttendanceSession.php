<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'club_id',
        'event_id',
        'created_by',
        'title',
        'venue',
        'date',
        'is_open',
    ];


    public function club()
    {
        return $this->belongsTo(Club::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
