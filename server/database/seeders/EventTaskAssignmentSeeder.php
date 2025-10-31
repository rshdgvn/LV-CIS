<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EventTask;
use App\Models\ClubMembership;
use App\Models\EventTaskAssignment;
use Illuminate\Support\Carbon;

class EventTaskAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        $tasks = EventTask::all();
        $memberships = ClubMembership::with('user')->get();

        if ($tasks->isEmpty()) {
            $this->command->warn('No event tasks found. Please seed EventTaskSeeder first.');
            return;
        }

        if ($memberships->isEmpty()) {
            $this->command->warn('No club memberships found. Please seed ClubMembershipSeeder first.');
            return;
        }

        foreach ($tasks as $task) {
            $assignedMembers = $memberships->random(rand(1, min(2, $memberships->count())));

            foreach ($assignedMembers as $membership) {
                EventTaskAssignment::firstOrCreate([
                    'event_task_id' => $task->id,
                    'club_membership_id' => $membership->id,
                ], [
                    'assigned_at' => Carbon::now()->subDays(rand(0, 5)),
                ]);
            }
        }

    }
}
