<?php

namespace App\Http\Controllers;

use App\Models\EventTask;
use App\Models\EventTaskAssignment;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Get all tasks (optionally filter by event)
     */
    public function getAllTasks(Request $request)
    {
        $query = EventTask::with(['event', 'assignments.clubMembership.user']);

        if ($request->has('event_id')) {
            $query->where('event_id', $request->event_id);
        }

        $tasks = $query->get();

        return response()->json($tasks);
    }

    /**
     * Get task by ID (with relationships)
     */
    public function getTaskById($id)
    {
        $task = EventTask::with(['event', 'assignments.clubMembership.user'])->find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        return response()->json($task);
    }

    /**
     * Create a new task for a specific event
     */
    public function createTaskForEvent(Request $request)
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:low,medium,high',
            'status' => 'required|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
            'assigned_members' => 'nullable|array', 
            'assigned_members.*' => 'exists:club_memberships,id',
        ]);

        $task = EventTask::create([
            'event_id' => $request->event_id,
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->priority,
            'status' => $request->status,
            'due_date' => $request->due_date ?? now()->addDays(5),
        ]);

        // Optionally assign members to the task
        if ($request->has('assigned_members')) {
            foreach ($request->assigned_members as $clubMembershipId) {
                EventTaskAssignment::create([
                    'event_task_id' => $task->id,
                    'club_membership_id' => $clubMembershipId,
                    'assigned_at' => now(),
                ]);
            }
        }

        return response()->json(
            $task->load(['assignments.clubMembership.user']),
            201
        );
    }

    /**
     * Update an existing task
     */
    public function updateTaskById(Request $request, $id)
    {
        $task = EventTask::find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|required|in:low,medium,high',
            'status' => 'sometimes|required|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
        ]);

        $task->update($request->only(['title', 'description', 'priority', 'status', 'due_date']));

        return response()->json($task->load(['assignments.clubMembership.user']));
    }

    /**
     * Delete a task by ID
     */
    public function deleteTaskById($id)
    {
        $task = EventTask::find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }

    /**
     * Get all tasks for a specific event, including assigned users
     */
    public function getTasksByEvent($eventId)
    {
        $tasks = EventTask::where('event_id', $eventId)
            ->with(['assignments.clubMembership.user'])
            ->get();

        if ($tasks->isEmpty()) {
            return response()->json(['message' => 'No tasks found for this event'], 404);
        }

        $tasks = $tasks->map(function ($task) {
            $assignedUsers = $task->assignments
                ->map(fn($a) => [
                    'id' => $a->clubMembership->user->id ?? null,
                    'name' => $a->clubMembership->user->name ?? null,
                    'assigned_at' => $a->assigned_at,
                ])
                ->filter(fn($u) => $u['id'])
                ->values();

            return [
                'id' => $task->id,
                'title' => $task->title,
                'priority' => $task->priority,
                'status' => $task->status,
                'due_date' => $task->due_date,
                'assigned_users' => $assignedUsers,
            ];
        });

        return response()->json($tasks);
    }
}
