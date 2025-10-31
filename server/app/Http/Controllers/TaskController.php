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
        $tasks = \App\Models\EventTask::where('event_id', $eventId)
            ->with(['assignments.clubMembership.user'])
            ->get();

        if ($tasks->isEmpty()) {
            return response()->json(['message' => 'No tasks found for this event'], 404);
        }

        $tasks = $tasks->map(function ($task) {
            $assignedBy = $task->assignments->map(function ($assignment) {
                return $assignment->clubMembership->user->name ?? null;
            })->filter()->values();

            return [
                'id' => $task->id,
                'title' => $task->title,
                'priority' => $task->priority,
                'status' => $task->status,
                'due_date' => $task->due_date,
                'assigned_by' => $assignedBy,
            ];
        });

        return response()->json($tasks);
    }
}
