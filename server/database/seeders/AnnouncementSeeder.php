<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Announcement;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        Announcement::insert([
            [
                'title' => 'Welcome to LVCIS!',
                'content' => 'We are excited to launch the new Lucis platform. Stay tuned for upcoming features and updates.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'System Maintenance',
                'content' => 'The system will undergo maintenance on Friday from 10 PM to 2 AM. Please save your work beforehand.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Organization Registration Now Open',
                'content' => 'Student organizations can now register for the new semester. Deadline is next month.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Archived Announcement Example',
                'content' => 'This announcement is archived and no longer visible to regular users.',
                'status' => 'archived',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
