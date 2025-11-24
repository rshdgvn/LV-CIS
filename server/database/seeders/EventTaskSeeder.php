<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventTask;
use Carbon\Carbon;

class EventTaskSeeder extends Seeder
{
    public function run(): void
    {
        $events = Event::with('detail')->get();

        if ($events->isEmpty()) {
            $this->command->warn('No events found. Please seed events first.');
            return;
        }

        foreach ($events as $event) {
            $eventDate = $event->detail?->event_date
                ? Carbon::parse($event->detail->event_date)
                : now()->addDays(5);

            $tasks = [
                [
                    'title' => 'Prepare logistics for ' . $event->title,
                    'description' => 'Coordinate with suppliers, arrange materials, and prepare transportation.',
                    'status' => 'completed',
                    'due_date' => $eventDate->copy()->subDays(3),
                ],
                [
                    'title' => 'Design marketing materials for ' . $event->title,
                    'description' => 'Create posters and social media content for event promotion.',
                    'status' => 'in_progress',
                    'due_date' => $eventDate->copy()->subDays(5),
                ],
                [
                    'title' => 'Confirm attendance list for ' . $event->title,
                    'description' => 'Gather RSVPs and finalize participant count.',
                    'status' => 'pending',
                    'due_date' => $eventDate->copy()->subDays(1),
                ],
            ];

            foreach ($tasks as $task) {
                EventTask::create([
                    'event_id' => $event->id,
                    ...$task,
                ]);
            }
        }

    }
}
