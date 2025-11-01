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
            ->withPivot('role', 'officer_title', 'status', 'joined_at')
            ->withTimestamps();
    }


    public function getLogoUrlAttribute()
    {
        if (!$this->logo) {
            return null;
        }

        return Storage::disk('public')->url($this->logo);
    }
}
