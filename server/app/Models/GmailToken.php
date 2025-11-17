<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GmailToken extends Model
{
    protected $fillable = [
        'identifier',
        'access_token',
        'refresh_token',
        'scope',
        'token_type',
        'expires_in',
        'token_created_at',
    ];

    protected $casts = [
        'token_created_at' => 'datetime',
    ];
}
