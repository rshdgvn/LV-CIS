<?php

namespace App\Policies;

use App\Models\ClubMembership;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;
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
            return Response::deny('You are not a member of this club.');
        }

        // Admin can approve/reject anyone
        if ($user->role === 'admin') {
            return Response::allow();
        }

        // Officer can only manage members (not admins/officers)
        if ($authMembership->role === 'officer' && $membership->role === 'member') {
            return Response::allow();
        }

        return Response::deny('Only officers and admins can approve or reject members.');
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
            return Response::deny('You must be a member of this club to request a role change.');
        }

        // Members can request role change
        if ($authMembership->role === 'member') {
            return Response::allow();
        }

        return Response::deny('Only members can request to become officers.');
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
            return Response::deny('You are not part of this club.');
        }

        // Admin can approve anyone
        if ($user->role === 'admin') {
            return Response::allow();
        }

        // Officer can only approve role changes for members
        if ($authMembership->role === 'officer' && $membership->role === 'member') {
            return Response::allow();
        }

        return Response::deny('You do not have permission to approve role changes.');
    }

     /**
     * Determine if the user can add a member.
     */
    public function addMember(User $user, $clubId)
    {
        $authMembership = DB::table('club_memberships')
            ->where('club_id', $clubId)
            ->where('user_id', $user->id)
            ->first();

        if (!$authMembership) {
            return Response::deny('You are not part of this club.');
        }

        // Only admin or officer can add members
        if ($user->role === 'admin' || $authMembership->role === 'officer') {
            return Response::allow();
        }

        return Response::deny('Only admins and officers can add members.');
    }

    /**
     * Determine if the user can remove a member.
     */
    public function removeMember(User $user, ClubMembership $membership)
    {
        $authMembership = DB::table('club_memberships')
            ->where('club_id', $membership->club_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$authMembership) {
            return Response::deny('You are not part of this club.');
        }

        // Only admin or officer can remove members
        if ($user->role === 'admin' || $authMembership->role === 'officer') {
            return Response::allow();
        }

        return Response::deny('Only admins and officers can remove members.');
    }

    /**
     * Determine if the user can edit a member's pivot info.
     */
    public function editMemberPivot(User $user, ClubMembership $membership)
    {
        $authMembership = DB::table('club_memberships')
            ->where('club_id', $membership->club_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$authMembership) {
            return Response::deny('You are not part of this club.');
        }

        // Admin and officer can edit anyone in their club
        if ($user->role === 'admin' || $authMembership->role === 'officer') {
            return Response::allow();
        }

        // Member can edit only their own pivot info
        if ($membership->user_id === $user->id) {
            return Response::allow();
        }

        return Response::deny('You do not have permission to edit this member.');
    }
}
