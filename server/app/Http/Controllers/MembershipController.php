<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\ClubMembership;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MembershipController extends Controller
{
    // Join a club
    public function joinClub(Request $request, $clubId)
    {
        $club = Club::findOrFail($clubId);
        $user = $request->user(); // authenticated user

        // Check if already a member
        if ($club->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Already a member or pending approval'], 409);
        }

        $club->users()->attach($user->id, [
            'role' => 'member',
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Membership request sent successfully']);
    }

    // Approve or reject a membership
    public function updateMembershipStatus(Request $request, $clubId, $userId)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        DB::table('club_memberships')
            ->where('club_id', $clubId)
            ->where('user_id', $userId)
            ->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Membership status updated']);
    }

    // Get all members of a club
    public function getClubMembers($clubId)
    {
        $club = Club::with(['users' => function ($query) {
            $query->select('users.id', 'users.name', 'users.email', 'users.course', 'users.year_level', 'users.student_id');
        }])->findOrFail($clubId);

        return response()->json($club->users);
    }

    public function getClubMember($clubId, $userId)
    {
        $membership = ClubMembership::where('club_id', $clubId)
            ->where('user_id', $userId)
            ->first();

        if (!$membership) {
            return response()->json(['message' => 'Member not found'], 404);
        }

        $user = User::with('member')->find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json([
            'member' => $membership,
            'user' => $user->member, 
        ]);
    }




    // Get all clubs joined by the logged-in user
    public function getUserClubs(Request $request)
    {
        $user = $request->user();
        $clubs = $user->clubs()->withPivot('role', 'status', 'joined_at')->get();

        return response()->json($clubs);
    }
}
