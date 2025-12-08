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

        $task->load('assignments.clubMembership.user');

        $assignedUsers = $task->assignments->map(function ($assignment) {
            $user = $assignment->clubMembership->user;
            if (!$user) return null;
            return [
                'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'avatar' => $user->avatar ?? null,
            ];
        })->filter()->values();

        return response()->json([
            'id' => $task->id,
            'title' => $task->title,
            'status' => $task->status,
            'due_date' => $task->due_date,
            'assigned_by' => $assignedUsers,
        ], 200);
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
    /**
     * Get detailed task by ID (task + assignments + event + available club members)
     */
    public function getTaskDetail($id)
    {
        $task = EventTask::with([
            'event.club',
            'assignments.clubMembership.user'
        ])->find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        // Transform assignments into usable shape for frontend
        $assigned = $task->assignments->map(function ($assignment) {
            $m = $assignment->clubMembership;
            $user = $m->user ?? null;
            return [
                'assignment_id' => $assignment->id,
                'club_membership_id' => $m->id,
                'user' => $user ? [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name'  => $user->last_name,
                    'avatar'     => $user->avatar ?? null,
                    'email'      => $user->email ?? null,
                ] : null,
                'assigned_at' => optional($assignment->assigned_at)->toDateTimeString(),
            ];
        });

        // If event->club exists, return full membership list for that club
        $availableMembers = [];
        if ($task->event && $task->event->club) {
            $availableMembers = ClubMembership::where('club_id', $task->event->club->id)
                ->with('user:id,first_name,last_name,avatar,email')
                ->get(['id', 'user_id', 'club_id']);
        }

        return response()->json([
            'task' => $task,
            'assigned' => $assigned,
            'members' => $availableMembers,
        ]);
    }

    /**
     * Update an existing task and sync assigned_members (array of club_membership ids)
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
            'assigned_members' => 'nullable|array',
            'assigned_members.*' => 'integer|exists:club_memberships,id',
        ]);

        // Update basic fields
        $task->update($request->only(['title', 'description', 'status', 'due_date']));

        // Sync assignments if assigned_members provided
        if ($request->has('assigned_members')) {
            $newMembershipIds = collect($request->assigned_members)->map(fn($v) => (int)$v)->unique()->values();

            // existing assignment membership ids
            $existing = EventTaskAssignment::where('event_task_id', $task->id)
                ->pluck('club_membership_id')
                ->map(fn($v) => (int)$v);

            $toAdd = $newMembershipIds->diff($existing);
            $toRemove = $existing->diff($newMembershipIds);

            // Create new assignments
            foreach ($toAdd as $membershipId) {
                EventTaskAssignment::create([
                    'event_task_id' => $task->id,
                    'club_membership_id' => $membershipId,
                    'assigned_at' => now(),
                ]);
            }

            // Remove assignments no longer wanted
            if ($toRemove->isNotEmpty()) {
                EventTaskAssignment::where('event_task_id', $task->id)
                    ->whereIn('club_membership_id', $toRemove->all())
                    ->delete();
            }
        }


        $task->load('assignments.clubMembership.user');

        $assignedUsers = $task->assignments->map(function ($assignment) {
            $user = $assignment->clubMembership->user;
            if (!$user) return null;
            return [
                'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'avatar' => $user->avatar ?? null,
            ];
        })->filter()->values();

        return response()->json([
            'id' => $task->id,
            'title' => $task->title,
            'status' => $task->status,
            'due_date' => $task->due_date,
            'assigned_by' => $assignedUsers,
        ], 200);
    }


    /**
     * Get task by event ID
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

        $tasks = $tasks->map(function ($task) {
            $assignedUsers = $task->assignments
                ->map(function ($assignment) {
                    $user = $assignment->clubMembership?->user;
                    if (!$user) return null;

                    return [
                        'name'   => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                        'avatar' => $user->avatar ?? null,
                    ];
                })
                ->filter()
                ->values();

            return [
                'id'          => $task->id,
                'title'       => $task->title,
                'status'      => $task->status,
                'due_date'    => $task->due_date,
                'created_at'  => optional($task->created_at)->format('Y-m-d'),
                'assigned_by' => $assignedUsers,
            ];
        });

        $event = Event::with('club')->findOrFail($eventId);

        $members = ClubMembership::where('club_id', $event->club->id)
            ->with('user:id,first_name,last_name,avatar')
            ->get(['id', 'user_id', 'club_id']);

        return response()->json([
            "tasks"   => $tasks,
            "members" => $members
        ]);
    }


    /**
     * Update only the status of a task
     */
    public function updateTaskStatus(Request $request, $id)
    {
        $task = EventTask::find($id);

        if (!$task) {
            return response()->json(['message' => 'Task not found'], 404);
        }

        $request->validate([
            'status' => 'required|in:pending,in_progress,completed',
        ]);

        $task->status = $request->status;
        $task->save();

        return response()->json([
            'id' => $task->id,
            'status' => $task->status,
            'message' => 'Status updated successfully'
        ], 200);
    }

    public function deleteTaskById($id)
    {
        $task = EventTask::with('event.club')->findOrFail($id);

        $task->assignments()->delete();
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }

    /**
     * Get tasks assigned to the logged-in user
     */
    public function getMyTasks(Request $request)
    {
        $user = $request->user();

        // 1. Get all Club Membership IDs for the current user
        $membershipIds = ClubMembership::where('user_id', $user->id)->pluck('id');

        if ($membershipIds->isEmpty()) {
            return response()->json(['tasks' => []]);
        }

        // 2. Query EventTasks that have an assignment matching one of the user's membership IDs
        $tasks = EventTask::whereHas('assignments', function ($query) use ($membershipIds) {
            $query->whereIn('club_membership_id', $membershipIds);
        })
            ->with([
                'event:id,title', // Load event title for context
                'assignments.clubMembership.user:id,first_name,last_name,avatar' // Load all people assigned to this task (for avatars)
            ])
            ->orderBy('due_date', 'asc') // Sort by nearest due date
            ->get();

        // 3. Format the data to match the Frontend structure
        $formattedTasks = $tasks->map(function ($task) {

            // Get all users assigned to this task (to display avatars)
            $assignedUsers = $task->assignments->map(function ($assignment) {
                $u = $assignment->clubMembership->user;
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

        return response()->json(['tasks' => $formattedTasks]);
    }
}
