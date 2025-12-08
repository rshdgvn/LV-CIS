<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarEvent extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'start_time', 'end_time', 'theme'];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];
}
