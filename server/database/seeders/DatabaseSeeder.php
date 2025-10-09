<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Club;
use App\Models\Member;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@example.com')],
            [
                'name' => env('ADMIN_NAME', 'Administrator'),
                'username' => 'bossDan',
                'password' => Hash::make(env('ADMIN_PASSWORD', 'password')),
                'role' => 'admin',
            ]
        );

        $clubs = collect([
            'AIM',
            'JPIA',
            'BroadSoc',
            'Social Sheet',
            'Cyverdarians',
            'MaArtees',
            'DRRT',
            'LV de corale',
            'Sports Club',
        ])->map(function ($clubName) {
            return Club::firstOrCreate([
                'name' => $clubName,
            ], [
                'description' => fake()->sentence(10),
                'adviser' => fake()->name(),
                'logo' => null,
            ]);
        });

        $users = User::factory(10)->create([
            'role' => 'user',
        ]);

        foreach ($users as $user) {
            Member::firstOrCreate([
                'user_id' => $user->id,
            ], [
                'student_id' => fake()->unique()->numerify('STU###'),
                'course' => fake()->randomElement(['BSIT', 'BSBA', 'BSHM', 'BSED']),
                'year_level' => fake()->numberBetween(1, 4),
            ]);
        }

        foreach ($users as $user) {
            $randomClubs = $clubs->random(rand(2, 4));
            foreach ($randomClubs as $club) {
                $club->users()->attach($user->id, [
                    'role' => 'member',
                    'status' => fake()->randomElement(['approved', 'pending']),
                    'joined_at' => now(),
                ]);
            }
        }

        foreach ($clubs as $club) {
            $club->users()->attach($admin->id, [
                'role' => 'adviser',
                'status' => 'approved',
                'joined_at' => now(),
            ]);
        }
    }
}
