<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Announcement;
use App\Models\Club;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $announcements = [];

        // 10 General announcements
        for ($i = 1; $i <= 10; $i++) {
            $announcements[] = [
                'title' => "General Announcement #$i",
                'date' => $now->addDays($i)->format('Y-m-d'),
                'time' => '09:00:00',
                'venue' => 'University Hall',
                'description' => "This is general announcement number $i for all students.",
                'status' => 'active',
                'target_type' => 'general',
                'club_id' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Get all clubs
        $clubs = Club::all();

        // 3 announcements per club
        foreach ($clubs as $club) {
            for ($i = 1; $i <= 3; $i++) {
                $announcements[] = [
                    'title' => "{$club->name} Announcement #$i",
                    'date' => $now->addDays($i)->format('Y-m-d'),
                    'time' => '13:00:00',
                    'venue' => $club->name . ' Hall',
                    'description' => "This is announcement #$i for the {$club->name} club.",
                    'status' => 'active',
                    'target_type' => 'club',
                    'club_id' => $club->id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        Announcement::insert($announcements);
    }
}
