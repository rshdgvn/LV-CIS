<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'date',
        'time',
        'venue',
        'description',
        'status',
        'target_type',
        'club_id'
    ];

    public function club()
    {
        return $this->belongsTo(Club::class);
    }
}
