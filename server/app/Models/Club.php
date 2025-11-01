<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    protected $fillable = ['name', 'description', 'category', 'adviser', 'logo'];

    protected $appends = ['logo_url'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'club_memberships')
            ->withPivot('role', 'officer_title', 'status', 'joined_at')
            ->withTimestamps();
    }

    public function getLogoUrlAttribute()
    {
        if (!$this->logo) {
            return null;
        }

        $url = asset('storage/' . $this->logo);
        return str_replace('http://', 'https://', $url);
    }
}
