<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;


class Club extends Model
{
    protected $fillable = ['name', 'description', 'category', 'adviser', 'logo'];

    protected $appends = ['logo_url'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'club_memberships')
            ->withPivot('role', 'officer_title', 'status', 'joined_at', 'activity_status')
            ->withTimestamps();
    }

    public function approvedUsers()
    {
        return $this->belongsToMany(User::class, 'club_memberships')
            ->wherePivot('status', 'approved') 
            ->withPivot('role', 'officer_title', 'status', 'joined_at', 'activity_status')
            ->withTimestamps();
    }


    public function getLogoUrlAttribute()
    {
        if (!$this->logo) {
            return null;
        }

        if (str_starts_with($this->logo, 'http')) {
            return $this->logo;
        }

        return asset('storage/' . $this->logo);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }
}
