<?php

namespace App\Models;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'avatar'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function member()
    {
        return $this->hasOne(Member::class);
    }

    public function clubMemberships()
    {
        return $this->hasMany(ClubMembership::class, 'user_id');
    }

    public function clubs()
    {
        return $this->belongsToMany(Club::class, 'club_memberships')
            ->withPivot('status', 'role', 'joined_at')
            ->withTimestamps();
    }

    public function sendPasswordResetNotification($token)
    {
        $url = config('app.frontend_url') . "/reset-password?token=$token&email=" . urlencode($this->email);
        $this->notify(new ResetPassword($url));
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
