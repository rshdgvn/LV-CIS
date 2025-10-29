<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventTask;
use App\Models\EventTaskComment;
use App\Models\EventTaskAttachment;
use App\Models\EventTaskAssignment;

class EventTaskSeeder extends Seeder
{
    public function run(): void
    {
        $events = Event::all();

        if ($events->isEmpty()) {
            $this->command->warn('⚠️ No events found. Please run EventSeeder first.');
            return;
        }

        foreach ($events as $event) {
            $tasks = [
                [
                    'title' => 'Prepare logistics for ' . $event->title,
                    'description' => 'Coordinate with suppliers, arrange materials, and prepare transportation.',
                    'priority' => 'high',
                    'status' => 'completed',
                    'due_date' => $event->start_date->subDays(3),
                ],
                [
                    'title' => 'Design marketing materials for ' . $event->title,
                    'description' => 'Create posters and social media content for event promotion.',
                    'priority' => 'medium',
                    'status' => 'in_progress',
                    'due_date' => $event->start_date->subDays(5),
                ],
                [
                    'title' => 'Submit event report for ' . $event->title,
                    'description' => 'Collect feedback, attendance, and create summary report.',
                    'priority' => 'low',
                    'status' => 'pending',
                    'due_date' => $event->end_date->addDays(2),
                ],
            ];

            foreach ($tasks as $data) {
                $task = EventTask::create([
                    'event_id' => $event->id,
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'priority' => $data['priority'],
                    'status' => $data['status'],
                    'due_date' => $data['due_date'],
                ]);

                EventTaskAssignment::create([
                    'event_task_id' => $task->id,
                    'club_membership_id' => 1,
                    'assigned_at' => now(),
                ]);

                EventTaskComment::create([
                    'event_task_id' => $task->id,
                    'club_membership_id' => 1,
                    'comment' => 'Let’s start working on this soon!',
                ]);

                EventTaskComment::create([
                    'event_task_id' => $task->id,
                    'club_membership_id' => 1,
                    'comment' => 'Please coordinate with the adviser for approval.',
                ]);

                EventTaskAttachment::create([
                    'event_task_id' => $task->id,
                    'file_path' => 'attachments/' . str_replace(' ', '_', strtolower($data['title'])) . '_plan.pdf',
                    'uploaded_by' => 1, 
                ]);
            }
        }
    }
}
