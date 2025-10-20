<?php

namespace App\Policies;

use App\Models\ClubMembership;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\DB;

class ClubMembershipPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can update a member’s status (approve/reject).
     */
    public function updateStatus(User $user, ClubMembership $membership)
    {
        $authMembership = DB::table('club_memberships')
            ->where('club_id', $membership->club_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$authMembership) {
            return false; // Not part of this club
        }

        // Only admin or officer can update statuses
        return in_array($authMembership->role, ['admin', 'officer']);
    }

    /**
     * Determine if the user can request a role change.
     */
    public function requestRoleChange(User $user, ClubMembership $membership)
    {
        $authMembership = DB::table('club_memberships')
            ->where('club_id', $membership->club_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$authMembership) {
            return false;
        }

        // Members can request role change
        return $authMembership->role === 'member';
    }

    /**
     * Determine if the user can approve or deny a role change.
     */
    public function approveRoleChange(User $user, ClubMembership $membership)
    {
        $authMembership = DB::table('club_memberships')
            ->where('club_id', $membership->club_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$authMembership) {
            return false;
        }

        // Admin or officer can approve
        return in_array($authMembership->role, ['admin', 'officer']);
    }
}
