<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\ClubMembership;
use App\Models\Member;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;

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

        $validated = $request->validate([
            'role' => 'required|in:member,officer',
            'officerTitle' => 'nullable|string|max:255',
        ]);

        if ($club->users()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'Already a member or pending approval'
            ], 409);
        }

        $club->users()->attach($user->id, [
            'role' => $validated['role'],
            'status' => 'pending',
            'officer_title' => $validated['role'] === 'officer' ? $validated['officerTitle'] : null,
        ]);

        return response()->json([
            'message' => 'Membership request sent successfully',
            'role' => $validated['role'],
            'officerTitle' => $validated['role'] === 'officer' ? $validated['officerTitle'] : null,
        ]);
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
        $authResponse = $this->authorizeForUser(Auth::user(), 'updateRoleChange', $membership);

        if ($authResponse->denied()) {
            return response()->json(['message' => $authResponse->message()], 403);
        }


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

        if ($membership->role !== 'member') {
            return response()->json([
                'message' => 'Only members can request a role change to officer.'
            ], 403);
        }

        $validated = $request->validate([
            'new_role' => 'required|in:officer',
        ]);

        if ($membership->requested_role === 'officer') {
            return response()->json([
                'message' => 'You have already requested a role change to officer. Please wait for approval.'
            ], 409);
        }

        $membership->update([
            'requested_role' => $validated['new_role'],
        ]);

        return response()->json([
            'message' => 'Role change request submitted successfully for approval.'
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
        $this->authorize('updateRoleChange', $membership);

        if (!$membership->requested_role) {
            return response()->json(['message' => 'No pending role change request'], 404);
        }

        $membership->update([
            'role' => $membership->requested_role,
            'requested_role' => null,
        ]);

        return response()->json(['message' => 'Role change approved successfully']);
    }

    public function rejectRoleChange(Request $request, $clubId, $userId)
    {
        $membership = ClubMembership::where('club_id', $clubId)
            ->where('user_id', $userId)
            ->firstOrFail();

        // Policy check (only officer/admin)
        $this->authorize('updateRoleChange', $membership);

        if (!$membership->requested_role) {
            return response()->json(['message' => 'No pending role change request'], 404);
        }

        // Remove the pending request
        $membership->update([
            'requested_role' => null,
        ]);

        return response()->json(['message' => 'Role change request rejected successfully']);
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

        $clubs = $user->clubs()
            ->wherePivot('status', 'approved') 
            ->withPivot('role', 'status', 'joined_at')
            ->get();

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

    /**
     * Add a user as a member to a club (directly, bypassing join request)
     */
    public function addMember(Request $request, $clubId)
    {
        $club = Club::findOrFail($clubId);

        $this->authorize('addMember', [ClubMembership::class, $clubId]);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:member,officer',
            'officerTitle' => 'nullable|string|max:255',
        ]);

        if ($club->users()->where('user_id', $validated['user_id'])->exists()) {
            return response()->json([
                'message' => 'User is already a member of this club'
            ], 409);
        }

        $club->users()->attach($validated['user_id'], [
            'role' => $validated['role'],
            'status' => 'approved',
            'officer_title' => $validated['role'] === 'officer' ? $validated['officerTitle'] : null,
        ]);

        return response()->json(['message' => 'Member added successfully']);
    }

    /**
     * Edit a member's info in the pivot table (role, status, officer title)
     */
    public function editMember(Request $request, $clubId, $userId)
    {
        $membership = ClubMembership::where('club_id', $clubId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $this->authorize('editMemberPivot', $membership);

        $validated = $request->validate([
            'role' => 'sometimes|in:member,officer',
            'status' => 'sometimes|in:pending,approved,rejected',
            'officer_title' => 'nullable|string|max:255',
        ]);

        $membership->update($validated);

        return response()->json(['message' => 'Member info updated successfully']);
    }

    /**
     * Remove a member from a club
     */
    public function removeMember(Request $request, $clubId, $userId)
    {
        $membership = ClubMembership::where('club_id', $clubId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $this->authorize('removeMember', $membership);

        $membership->delete();

        return response()->json(['message' => 'Member removed successfully']);
    }
}
