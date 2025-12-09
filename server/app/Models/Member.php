<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = [
        'user_id',
        'course',
        'year_level',
        'student_number', 
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function clubs()
    {
        return $this->belongsToMany(Club::class, 'club_memberships')
            ->withPivot('role', 'status', 'joined_at')
            ->withTimestamps();
    }
}
