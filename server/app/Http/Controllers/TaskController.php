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
     * Get all tasks (optionally filter by event)
     */
    public function getAllTasks(Request $request)
    {
        $query = EventTask::with('event');

        if ($request->has('event_id')) {
            $query->where('event_id', $request->event_id);
        }

        $tasks = $query->get();

        return response()->json(["tasks" => $tasks, 'message' => 'test']);
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
            'assigned_members' => 'array',
        ]);

        $task = EventTask::create([
            'event_id' => $request->event_id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'due_date' => $request->due_date ?? now()->addDays(5),
        ]);

        if ($request->has('assigned_members')) {
            foreach ($request->assigned_members as $memberId) {
                EventTaskAssignment::create([
                    'event_task_id'      => $task->id,
                    'club_membership_id' => $memberId,
                    'assigned_at'        => now(),
                ]);
            }
        }

        return response()->json($task->load(['assignments.clubMembership.user']), 201);
    }


    /**
     * Assign task using email
     */
    public function assignTaskByEmail(Request $request, $taskId)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $task = EventTask::find($taskId);
        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $membership = ClubMembership::where('user_id', $user->id)->first();
        if (!$membership) {
            return response()->json(['message' => 'User is not part of any club'], 400);
        }

        $alreadyAssigned = EventTaskAssignment::where('event_task_id', $taskId)
            ->where('club_membership_id', $membership->id)
            ->exists();

        if ($alreadyAssigned) {
            return response()->json(['message' => 'User already assigned'], 409);
        }

        $assignment = EventTaskAssignment::create([
            'event_task_id'      => $taskId,
            'club_membership_id' => $membership->id,
            'assigned_at'        => now(),
        ]);

        return response()->json([
            'message' => 'User assigned successfully',
            'assignment' => $assignment
        ], 201);
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
            'status' => 'sometimes|required|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
        ]);

        $task->update($request->only(['title', 'description', 'status', 'due_date']));

        return response()->json($task);
    }

    /**
     * Delete a task by ID
     */
    public function getTasksByEvent(Request $request, $eventId)
    {
        $query = EventTask::where('event_id', $eventId)
            ->with(['assignments.clubMembership.user']);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', strtolower($request->status));
        }

        if ($request->filled('search')) {
            $searchTerm = strtolower($request->search);
            $query->whereRaw('LOWER(title) LIKE ?', ["%{$searchTerm}%"]);
        }

        $tasks = $query->get();

        if ($tasks->isEmpty()) {
            return response()->json([]);
        }


        $tasks = $tasks->map(function ($task) {
            $assignedUsers = $task->assignments->map(function ($assignment) {
                $user = $assignment->clubMembership->user;
                if (!$user) return null;

                return [
                    'name'   => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                    'avatar' => $user->avatar ?? null,
                ];
            })->filter()->values();

            return [
                'id'         => $task->id,
                'title'      => $task->title,
                'status'     => $task->status,
                'due_date'   => $task->due_date,
                'created_at' => optional($task->created_at)->format('Y-m-d'),
                'assigned_by' => $assignedUsers,
            ];
        });

        $availableMembers = Event::find($eventId)->club->users;

        return response()->json(["tasks" => $tasks, 'members' => $availableMembers]);
    }
}
