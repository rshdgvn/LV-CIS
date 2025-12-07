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
                'title' => 'General Assembly 2025',
                'date' => '2025-01-15',
                'time' => '09:00:00',
                'venue' => 'University Gymnasium',
                'description' => 'Annual assembly discussing organizational updates and upcoming events.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Leadership Seminar',
                'date' => '2025-02-10',
                'time' => '13:00:00',
                'venue' => 'Multipurpose Hall',
                'description' => 'A workshop focused on improving leadership and communication skills.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Campus Clean-Up Drive',
                'date' => '2025-03-05',
                'time' => '07:30:00',
                'venue' => 'Main Campus Grounds',
                'description' => 'Environmental activity promoting sustainability among students.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
