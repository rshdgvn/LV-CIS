<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventTask;
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

        return response()->json($tasks);
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
            'priority' => 'required|in:low,medium,high',
            'status' => 'required|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
        ]);

        $task = EventTask::create([
            'event_id' => $request->event_id,
            'title' => $request->title,
            'description' => $request->description,
            'priority' => $request->priority,
            'status' => $request->status,
            'due_date' => $request->due_date ?? now()->addDays(5),
        ]);

        return response()->json($task, 201);
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

        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', strtolower($request->priority));
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
                    'avatar' => $user->avatar ?? null, // add avatar here
                ];
            })->filter()->values();

            return [
                'id'         => $task->id,
                'title'      => $task->title,
                'priority'   => $task->priority,
                'status'     => $task->status,
                'due_date'   => $task->due_date,
                'created_at' => optional($task->created_at)->format('Y-m-d'),
                'assigned_by' => $assignedUsers, 
            ];
        });

        return response()->json($tasks);
    }
}
