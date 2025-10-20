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

        // Admin can approve/reject anyone
        if ($user->role === 'admin') {
            return true;
        }

        // Officer can only manage members (not admins/officers)
        if ($authMembership->role === 'officer' && $membership->role === 'member') {
            return true;
        }

        return false;
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
    public function updateRoleChange(User $user, ClubMembership $membership)
    {
        $authMembership = DB::table('club_memberships')
            ->where('club_id', $membership->club_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$authMembership) {
            return false; // Not part of this club
        }

        // Admin can approve anyone
        if ($user->role === 'admin') {
            return true;
        }

        // Officer can only approve role changes for members
        if ($authMembership->role === 'officer' && $membership->role === 'member') {
            return true;
        }

        return false; // Everyone else denied
    }
}
