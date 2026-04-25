<?php

namespace App\Http\Controllers;

use App\Models\ClubMembership;
use App\Models\Event;
use App\Models\EventTask;
use App\Models\EventTaskAssignment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TaskController extends Controller
{
    /**
     * Get all tasks for an event
     */
    public function getTasksByEvent($eventId)
    {
        $event = Event::findOrFail($eventId);

        // FIX: If this is a GENERAL EVENT (no club_id), do not attempt to load tasks.
        // Return an empty structure immediately.
        if (is_null($event->club_id)) {
            return response()->json([
                'tasks' => [],
                'members' => [],
                'is_general' => true
            ]);
        }

        // Normal Task Logic for Club Events
        $tasks = EventTask::where('event_id', $eventId)
            ->with([
                'event:id,title',
                'assignments.clubMembership.user:id,first_name,last_name,avatar'
            ])
            ->orderBy('due_date', 'asc')
            ->get();

        // Get club members for assigning tasks
        $members = ClubMembership::with('user:id,first_name,last_name,avatar')
            ->where('club_id', $event->club_id)
            ->where('status', 'approved')
            ->get()
            ->map(function ($membership) {
                return [
                    'id' => $membership->id,
                    'user_id' => $membership->user_id,
                    'club_id' => $membership->club_id,
                    'user' => $membership->user
                ];
            });

        $formattedTasks = $tasks->map(function ($task) {
            $assignedUsers = $task->assignments->map(function ($assignment) {
                $u = $assignment->clubMembership->user ?? null;
                if (!$u) return null;
                return [
                    'name'   => trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? '')),
                    'avatar' => $u->avatar ?? null,
                ];
            })->filter()->values();

            return [
                'id'          => $task->id,
                'title'       => $task->title,
                'description' => $task->description,
                'status'      => $task->status,
                'due_date'    => $task->due_date,
                'event'       => $task->event ? [
                    'id'    => $task->event->id,
                    'title' => $task->event->title
                ] : null,
                'assigned_by' => $assignedUsers,
            ];
        });

        return response()->json([
            'tasks' => $formattedTasks,
            'members' => $members
        ]);
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
            'status' => 'required|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
            'assigned_members' => 'nullable|array',
            'assigned_members.*' => 'exists:club_memberships,id'
        ]);

        $event = Event::findOrFail($request->event_id);

        // FIX: Do not allow task creation for General Events
        if (is_null($event->club_id)) {
            return response()->json(['message' => 'General events do not support tasks.'], 403);
        }

        $task = EventTask::create([
            'event_id' => $request->event_id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'due_date' => $request->due_date ? Carbon::parse($request->due_date)->format('Y-m-d H:i:s') : null,
        ]);

        if ($request->has('assigned_members') && is_array($request->assigned_members)) {
            foreach ($request->assigned_members as $membershipId) {
                EventTaskAssignment::create([
                    'event_task_id' => $task->id,
                    'club_membership_id' => $membershipId,
                ]);
            }
        }

        return response()->json(['message' => 'Task created successfully', 'task' => $task], 201);
    }

    /**
     * Get all tasks (optionally filter by event)
     */
    public function getAllTasks(Request $request)
    {
        $query = EventTask::with('event');

        if ($request->has('event_id')) {
            $query->where('event_id', $request->event_id);
        }

        $tasks = $query->get();

        return response()->json(["tasks" => $tasks]);
    }

    /**
     * Get task by ID
     */
    public function getTaskById($id)
    {
        $task = EventTask::with('event')->find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        return response()->json($task);
    }

    /**
     * Update task
     */
    public function updateTask(Request $request, $id)
    {
        $task = EventTask::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
            'assigned_members' => 'nullable|array',
            'assigned_members.*' => 'exists:club_memberships,id'
        ]);

        $task->update($request->only(['title', 'description', 'status', 'due_date']));

        if ($request->has('assigned_members')) {
            $task->assignments()->delete();
            foreach ($request->assigned_members as $membershipId) {
                EventTaskAssignment::create([
                    'event_task_id' => $task->id,
                    'club_membership_id' => $membershipId,
                ]);
            }
        }

        return response()->json(['message' => 'Task updated successfully', 'task' => $task]);
    }

    /**
     * Update Task Status Only
     */
    public function updateTaskStatus(Request $request, $id)
    {
        $task = EventTask::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        $task->update(['status' => $request->status]);

        return response()->json(['message' => 'Task status updated successfully', 'task' => $task]);
    }

    /**
     * Delete Task
     */
    public function deleteTask($id)
    {
        $task = EventTask::findOrFail($id);
        $task->assignments()->delete();
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }
}