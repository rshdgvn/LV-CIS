<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'club_id',
        'title',
        'purpose',
        'description',
        'cover_image',
        'photos',
        'videos',
        'status',
    ];

    protected $casts = [
        'photos' => 'array',
        'videos' => 'array',
    ];

    public function club()
    {
        return $this->belongsTo(Club::class);
    }

    public function detail()
    {
        return $this->hasOne(EventDetail::class);
    }

    public function tasks()
    {
        return $this->hasMany(EventTask::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
