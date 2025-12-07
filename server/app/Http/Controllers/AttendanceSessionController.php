<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\ClubMembership;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceSessionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $clubId = $request->query('club_id');

        if (!$clubId) {
            return response()->json(['error' => 'club_id is required'], 400);
        }

        $isMember = ClubMembership::where('user_id', $user->id)
            ->where('club_id', $clubId)
            ->where('status', 'approved')
            ->exists();

        if (!$isMember) {
            return response()->json(['error' => 'You are not a member of this club'], 403);
        }

        $sessions = AttendanceSession::with(['club', 'event'])
            ->where('club_id', $clubId)
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'title' => $s->event ? $s->event->title : ($s->title ?? 'Untitled Session'),
                    'venue' => $s->venue ?? optional($s->event)->venue ?? 'N/A',
                    'date' => $s->date,
                    'is_open' => (bool) $s->is_open,
                    'club' => $s->club ? [
                        'id' => $s->club->id,
                        'name' => $s->club->name,
                    ] : null,
                    'event' => $s->event ? [
                        'id' => $s->event->id,
                        'title' => $s->event->title,
                    ] : null,
                ];
            });

        $totalMembers = $user->clubs()->where('club_id', $clubId)
            ->first()
            ->users()
            ->wherePivot('status', 'approved')
            ->count();

        $activeMembers = $user->clubs()->where('club_id', $clubId)
            ->first()
            ->users()
            ->wherePivot('status', 'approved')
            ->wherePivot('activity_status', 'active')
            ->count();

        $inactiveMembers = $user->clubs()->where('club_id', $clubId)
            ->first()
            ->users()
            ->wherePivot('status', 'approved')
            ->wherePivot('activity_status', 'inactive')
            ->count();

        $analytics = [
            'total_members' => $totalMembers,
            'active_members' => $activeMembers,
            'inactive_members' => $inactiveMembers
        ];

        return response()->json([
            'sessions' => $sessions,
            'analytics' => $analytics
        ]);
    }



    public function show($id)
    {
        $session = AttendanceSession::with(['club.approvedUsers.member', 'event'])->find($id);

        if (!$session) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        if (!$session->club || !$session->club->approvedUsers) {
            return response()->json(['message' => 'No club or members found'], 404);
        }

        $users = $session->club->approvedUsers->map(function ($user) use ($session) {
            $attendance = Attendance::where('attendance_session_id', $session->id)
                ->where('user_id', $user->id)
                ->first();

            $member = $user->member;

            return [
                'user_id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'avatar' => $user->avatar,
                'course' => $member ? ($member->course . ' ' . $member->year_level) : 'N/A',
                'status' => $attendance?->status ?? null,

            ];
        });

        return response()->json([
            'id' => $session->id,
            'title' => $session->event ? $session->event->title : ($session->title ?? 'Untitled Session'),
            'venue' => $session->venue ?? optional($session->event)->venue ?? 'N/A',
            'date' => $session->date,
            'is_open' => (bool) $session->is_open,
            'club' => $session->club ? [
                'id' => $session->club->id,
                'name' => $session->club->name,
            ] : null,
            'event' => $session->event ? [
                'id' => $session->event->id,
                'title' => $session->event->title,
            ] : null,
            'members' => $users,
        ]);
    }


    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'club_id' => 'required|exists:clubs,id',
            'title' => 'nullable|string|max:255',
            'venue' => 'nullable|string|max:255',
            'date' => 'required|date',
        ]);

        $isMember = ClubMembership::where('user_id', $user->id)
            ->where('club_id', $request->club_id)
            ->where('status', 'approved')
            ->exists();

        if (!$isMember) {
            return response()->json(['error' => 'You are not a member of this club'], 403);
        }

        $existing = AttendanceSession::where('club_id', $request->club_id)
            ->where('date', $request->date)
            ->where('title', $request->title)
            ->first();

        if ($existing) {
            return response()->json([
                'error' => 'A session with the same title and date already exists for this club'
            ], 409);
        }

        $session = AttendanceSession::create([
            'club_id' => $request->club_id,
            'created_by' => $user->id,
            'title' => $request->title,
            'venue' => $request->venue,
            'date' => $request->date,
            'is_open' => true,
        ]);
        
        return response()->json([
            'message' => 'Attendance session created successfully',
            'session' => $session
        ], 201);
    }

    // AttendanceSessionController.php

    public function update(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $session = AttendanceSession::find($id);
        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        $isMember = ClubMembership::where('user_id', $user->id)
            ->where('club_id', $session->club_id)
            ->where('status', 'approved')
            ->exists();

        if (!$isMember) {
            return response()->json(['error' => 'You are not a member of this club'], 403);
        }

        $request->validate([
            'title' => 'nullable|string|max:255',
            'venue' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'is_open' => 'nullable|boolean',
        ]);

        $session->update([
            'title' => $request->title ?? $session->title,
            'venue' => $request->venue ?? $session->venue,
            'date' => $request->date ?? $request->date,
            'is_open' => $request->has('is_open') ? $request->is_open : $session->is_open,
        ]);

        return response()->json([
            'message' => 'Attendance session updated successfully',
            'session' => $session
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $session = AttendanceSession::find($id);
        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        $isMember = ClubMembership::where('user_id', $user->id)
            ->where('club_id', $session->club_id)
            ->where('status', 'approved')
            ->exists();

        if (!$isMember) {
            return response()->json(['error' => 'You are not a member of this club'], 403);
        }

        $session->delete();

        return response()->json([
            'message' => 'Attendance session deleted successfully'
        ]);
    }
}
