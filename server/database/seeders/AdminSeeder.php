<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Carbon\Carbon;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $adminEmail = env('ADMIN_EMAIL', 'admin@example.com');

        $user = User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'first_name' => env('ADMIN_FIRST_NAME', 'Dan'),
                'last_name'  => env('ADMIN_LAST_NAME', 'Teves'),
                'password'   => Hash::make(env('ADMIN_PASSWORD', 'password')),
                'role'       => 'admin',
            ]
        );

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }
    }
}
