<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
{
    User::firstOrCreate(
        ['email' => env('ADMIN_EMAIL')],
        [
            'name' => env('ADMIN_NAME'),
            'password' => bcrypt(env('ADMIN_PASSWORD')),
            'role' => 'admin',
        ]
    );
}
}
