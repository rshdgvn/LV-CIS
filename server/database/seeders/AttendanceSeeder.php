<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AttendanceSession;
use App\Models\Attendance;
use App\Models\Club;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $clubs = Club::all();

        foreach ($clubs as $club) {
            for ($i = 1; $i <= rand(2, 3); $i++) {
                $session = AttendanceSession::create([
                    'club_id' => $club->id,
                    'event_id' => rand(0, 1) ? rand(1, 10) : null, 
                    'created_by' => $admin?->id,
                    'title' => "General Meeting {$i}",
                    'venue' => fake()->word(),
                    'date' => now()->subDays(rand(0, 15))->toDateString(),
                    'is_open' => fake()->boolean(80),
                ]);

                $memberUserIds = DB::table('club_memberships')
                    ->where('club_id', $club->id)
                    ->where('status', 'approved')
                    ->pluck('user_id')
                    ->toArray();

                foreach ($memberUserIds as $userId) {
                    Attendance::create([
                        'attendance_session_id' => $session->id,
                        'user_id' => $userId,
                        'status' => fake()->randomElement(['present', 'absent', 'late', 'excuse']),
                    ]);
                }
            }
        }
    }
}
