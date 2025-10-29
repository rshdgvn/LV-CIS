<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Club;
use App\Models\Member;

class ClubMembershipSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $clubs = Club::all();

        foreach ($clubs as $club) {
            $members = User::factory(10)->create(['role' => 'user']);

            foreach ($members as $user) {
                Member::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'student_id' => fake()->unique()->numerify('STU###'),
                        'course' => fake()->randomElement(['BSIS', 'BAB', 'BSSW', 'ACT', 'BSA', 'BSAIS']),
                        'year_level' => fake()->numberBetween(1, 4),
                    ]
                );

                DB::table('club_memberships')->insert([
                    'club_id' => $club->id,
                    'user_id' => $user->id,
                    'role' => fake()->randomElement(['member', 'officer']),
                    'status' => fake()->randomElement(['approved', 'pending']),
                    'joined_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('club_memberships')->insertOrIgnore([
                'club_id' => $club->id,
                'user_id' => $admin->id,
                'role' => 'officer',
                'status' => 'approved',
                'joined_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
