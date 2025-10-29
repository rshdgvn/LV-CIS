<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventDescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'overview',
        'objectives',
        'details',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
