<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    protected $fillable = ['name', 'description', 'adviser', 'logo'];

    public function members()
    {
        return $this->belongsToMany(Member::class, 'club_memberships')
            ->withPivot('role', 'status', 'joined_at')
            ->withTimestamps();
    }
    public function users()
    {
        return $this->belongsToMany(User::class, 'club_memberships')
            ->withPivot('role', 'status', 'joined_at')
            ->withTimestamps();
    }
}
