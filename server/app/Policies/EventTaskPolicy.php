<?php

namespace App\Policies;

use App\Models\EventTask;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\DB;

class EventTaskPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can create a task.
     * Only admins and officers of the club can create tasks.
     */
    public function createTask(User $user, $clubId)
    {
        $membership = DB::table('club_memberships')
            ->where('club_id', $clubId)
            ->where('user_id', $user->id)
            ->first();

        if (!$membership) {
            return Response::deny('You are not part of this club.');
        }

        if ($user->role === 'admin' || $membership->role === 'officer') {
            return Response::allow();
        }

        return Response::deny('Only admins and officers can create tasks.');
    }

    /**
     * Determine if the user can view/read a task.
     * All club members can read tasks.
     */
    public function view(User $user, EventTask $task)
    {
        $membership = DB::table('club_memberships')
            ->where('club_id', $task->club_id)
            ->where('user_id', $user->id)
            ->first();

        if ($membership) {
            return Response::allow();
        }

        return Response::deny('You are not part of this club.');
    }

    /**
     * Determine if the user can update a task.
     * Only admins and officers of the club can update tasks.
     */
    public function update(User $user, EventTask $task)
    {
        $membership = DB::table('club_memberships')
            ->where('club_id', $task->club_id)
            ->where('user_id', $user->id)
            ->first();

        // if (!$membership) {
        //     return Response::deny('You are not part of this club.');
        // }

        if ($user->role === 'admin' || $membership->role === 'officer') {
            return Response::allow();
        }

        return Response::allow();
    }

    /**
     * Determine if the user can update the task status.
     * Only assigned member can update task status.
     */
    public function updateStatus(User $user, EventTask $task)
    {
        if ($task->assigned_to === $user->id) {
            return Response::allow();
        }

        return Response::deny('Only the assigned member can update the task status.');
    }

    /**
     * Optional: Determine if the user can delete a task.
     * You can add admin/officer logic similar to update().
     */
    public function delete(User $user, EventTask $task)
    {
        $membership = DB::table('club_memberships')
            ->where('club_id', $task->club_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$membership) {
            return Response::deny('You are not part of this club.');
        }

        if ($user->role === 'admin' || $membership->role === 'officer') {
            return Response::allow();
        }

        return Response::deny('Only admins and officers can delete tasks.');
    }
}
