<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClubMembership extends Model
{
    protected $fillable = ['club_id', 'user_id', 'role', 'officer_title', 'requested_role', 'status', 'joined_at'];

    public function club()
    {
        return $this->belongsTo(Club::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
    