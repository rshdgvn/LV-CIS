<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Event;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\DB;

class EventPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can create an event.
     * Only admins can create events.
     */
    public function create(User $user)
    {
        if ($user->role === 'admin') {
            return Response::allow();
        }

        return Response::deny('Only admins can create events.');
    }

    /**
     * Determine if the user can update an event.
     * Admins and officers can update events.
     */
    public function update(User $user, Event $event)
    {
        $authMembership = DB::table('club_memberships')
            ->where('club_id', $event->club_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$authMembership) {
            return Response::deny('You are not part of this club.');
        }

        if ($user->role === 'admin' || $authMembership->role === 'officer') {
            return Response::allow();
        }

        return Response::deny('Only admins and officers can update events.');
    }

    /**
     * Determine if the user can delete an event.
     * Only admins can delete events.
     */
    public function delete(User $user, Event $event)
    {
        $authMembership = DB::table('club_memberships')
            ->where('club_id', $event->club_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$authMembership) {
            return Response::deny('You are not part of this club.');
        }

        if ($user->role === 'admin') {
            return Response::allow();
        }

        return Response::deny('Only admins can delete events.');
    }
}
