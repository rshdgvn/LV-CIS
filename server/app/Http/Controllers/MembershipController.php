<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\ClubMembership;
use App\Models\Member;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;


class MembershipController extends Controller
{
    use AuthorizesRequests;
    /**
     * Join a club (creates a pending membership request)
     */
    public function joinClub(Request $request, $clubId)
    {
        $club = Club::findOrFail($clubId);
        $user = $request->user();

        // Already requested or a member?
        if ($club->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Already a member or pending approval'], 409);
        }

        $club->users()->attach($user->id, [
            'role' => 'member',
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Membership request sent successfully']);
    }

    /**
     * Cancel a pending membership request
     */
    public function cancelMembershipRequest(Request $request, $clubId)
    {
        $club = Club::findOrFail($clubId);
        $user = $request->user();

        $membership = $club->users()
            ->where('user_id', $user->id)
            ->wherePivot('status', 'pending')
            ->first();

        if (!$membership) {
            return response()->json(['message' => 'No pending membership request found'], 404);
        }

        $club->users()->detach($user->id);

        return response()->json(['message' => 'Membership request cancelled successfully']);
    }

    /**
     * Approve or reject membership — only officers/admins can do this
     */
    public function updateMembershipStatus(Request $request, $clubId, $userId)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $membership = ClubMembership::where('club_id', $clubId)
            ->where('user_id', $userId)
            ->firstOrFail();


        // Policy check
        $this->authorize('updateStatus', $membership);

        $membership->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Membership status updated successfully']);
    }

    /**
     * Member requests a role change (e.g., member → officer)
     */
    public function requestRoleChange(Request $request, $clubId)
    {
        $user = $request->user();

        $membership = ClubMembership::where('club_id', $clubId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Only allow members to request a promotion
        if ($membership->role !== 'member') {
            return response()->json([
                'message' => 'Only members can request a role change to officer'
            ], 403); // Forbidden
        }

        // Validate input (only officer allowed)
        $validated = $request->validate([
            'new_role' => 'required|in:officer',
        ]);

        // Set the requested role
        $membership->update([
            'requested_role' => $validated['new_role'],
        ]);

        return response()->json([
            'message' => 'Role change request submitted for approval'
        ], 200);
    }

    /**
     * Admin or officer approves a role change request
     */
    public function approveRoleChange(Request $request, $clubId, $userId)
    {
        $membership = ClubMembership::where('club_id', $clubId)
            ->where('user_id', $userId)
            ->firstOrFail();

        // Policy check (only officer/admin)
        $this->authorize('approveRoleChange', $membership);

        if (!$membership->requested_role) {
            return response()->json(['message' => 'No pending role change request'], 404);
        }

        $membership->update([
            'role' => $membership->requested_role,
            'requested_role' => null,
        ]);

        return response()->json(['message' => 'Role change approved successfully']);
    }

    /**
     * Get all role change requests for a specific club
     */
    public function getRoleChangeRequests($clubId)
    {
        $club = Club::findOrFail($clubId);

        $requests = ClubMembership::with('user.member')
            ->where('club_id', $clubId)
            ->whereNotNull('requested_role')
            ->get()
            ->map(function ($membership) {
                return [
                    'user_id' => $membership->user->id,
                    'name' => $membership->user->name,
                    'email' => $membership->user->email,
                    'requested_role' => $membership->requested_role,
                    'course' => $membership->user->member?->course,
                    'year_level' => $membership->user->member?->year_level,
                    'student_id' => $membership->user->member?->student_id,
                    'requested_at' => $membership->updated_at,
                ];
            });

        return response()->json($requests);
    }

    /**
     * Get all members of a club
     */
    public function getClubMembers($clubId)
    {
        $club = Club::with(['users' => function ($query) {
            $query->select('users.id', 'users.name', 'users.email', 'users.course', 'users.year_level', 'users.student_id');
        }])->findOrFail($clubId);

        return response()->json($club->users);
    }

    /**
     * Get a specific club member’s info
     */
    public function getClubMember($clubId, $userId)
    {
        $membership = ClubMembership::where('club_id', $clubId)
            ->where('user_id', $userId)
            ->first();

        if (!$membership) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        $user = User::with('member')->find($userId);

        return response()->json([
            'member' => $membership,
            'user' => $user?->member,
        ]);
    }

    /**
     * Get all clubs joined by the logged-in user
     */
    public function getUserClubs(Request $request)
    {
        $user = $request->user();
        $clubs = $user->clubs()->withPivot('role', 'status', 'joined_at')->get();

        return response()->json($clubs);
    }

    /**
     * Get the current user’s member info
     */
    public function getCurrentUserMemberInfo(Request $request)
    {
        $user = $request->user();
        $member = $user->member;

        return response()->json(['member' => $member]);
    }

    /**
     * Get all pending requests for a specific club
     */
    public function getPendingRequests($clubId)
    {
        $club = Club::findOrFail($clubId);

        $pendingMembers = $club->users()
            ->wherePivot('status', 'pending')
            ->with('member') // Include member info if needed
            ->get()
            ->map(function ($user) {
                return [
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'student_id' => $user->member?->student_id,
                    'course' => $user->member?->course,
                    'year_level' => $user->member?->year_level,
                    'requested_at' => $user->pivot->created_at,
                ];
            });

        return response()->json($pendingMembers);
    }


    /**
     * Create or update the current user’s member info
     */
    public function editMemberInfo(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'student_id' => 'required|string|max:50',
            'course' => 'required|string|max:100',
            'year_level' => 'required|string|max:10',
        ]);

        $member = $user->member;

        if ($member) {
            $member->update($validated);
        } else {
            $user->member()->create($validated);
        }

        return response()->json([
            'message' => 'Member profile saved successfully',
            'member' => $member ?? $user->member,
        ]);
    }

    public function setupMemberProfile(Request $request)
    {
        $user = $request->user();

        // Check if the user already has a member profile
        if ($user->member) {
            return response()->json([
                'message' => 'Profile already exists. You can edit it instead.',
            ], 400);
        }


        $validated = $request->validate([
            'student_id' => 'required|string|max:50',
            'course' => 'required|string|max:100',
            'year_level' => 'required|string|max:10',
        ]);

        $data = array_merge(['user_id' => $user->id], $validated);
        $member = Member::create($data);

        return response()->json([
            'message' => 'Profile setup successfully',
            'member' => $member,
        ], 201);
    }
}
