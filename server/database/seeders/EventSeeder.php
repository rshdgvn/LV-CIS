<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventDescription;
use App\Models\Club;
use Illuminate\Support\Str;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $club = Club::first();

        if (!$club) {
            $this->command->warn('No clubs found. Please seed clubs first.');
            return;
        }

        $events = [
            [
                'title' => 'Leadership Training Camp',
                'start_date' => now()->addDays(10),
                'end_date' => now()->addDays(12),
                'location' => 'Camp Baguio',
                'status' => 'upcoming',
            ],
            [
                'title' => 'Community Outreach',
                'start_date' => now()->addDays(20),
                'end_date' => now()->addDays(21),
                'location' => 'Barangay San Jose',
                'status' => 'upcoming',
            ],
            [
                'title' => 'General Assembly',
                'start_date' => now()->addDays(30),
                'end_date' => now()->addDays(31),
                'location' => 'University Hall',
                'status' => 'upcoming',
            ],
        ];

        foreach ($events as $data) {
            $event = Event::create([
                'club_id' => $club->id,
                'title' => $data['title'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'location' => $data['location'],
                'status' => $data['status'],
            ]);

            EventDescription::create([
                'event_id' => $event->id,
                'overview' => 'This is a brief overview of ' . $data['title'] . '.',
                'objectives' => 'To enhance leadership, teamwork, and community involvement.',
                'details' => 'Detailed schedule and logistics will be shared soon.',
            ]);
        }
    }
}
