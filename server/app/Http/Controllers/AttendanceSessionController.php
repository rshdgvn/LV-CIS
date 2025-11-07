<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use App\Models\AttendanceSession;
use App\Models\ClubMembership;
use Illuminate\Support\Facades\Auth;

class AttendanceSessionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $clubIds = ClubMembership::where('user_id', $user->id)
            ->pluck('club_id');

        $sessions = AttendanceSession::with(['club', 'event'])
            ->whereIn('club_id', $clubIds)
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'title' => $s->title,
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

        return response()->json(['sessions' => $sessions]);
    }

    public function show($id)
    {
        $session = AttendanceSession::with(['club.users.member', 'event'])->find($id);

        if (!$session) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        if (!$session->club || !$session->club->users) {
            return response()->json(['message' => 'No club or members found'], 404);
        }

        $users = $session->club->users->map(function ($user) use ($session) {
            $attendance = Attendance::where('attendance_session_id', $session->id)
                ->where('user_id', $user->id)
                ->first();

            $member = $user->member; 

            return [
                'id' => $user->id,
                'name' => $user->name,
                'course' => $member->course ?? 'N/A',
                'year_level' => $member->year_level ?? 'N/A',
                'status' => $attendance ? $attendance->status : 'Absent',
            ];
        });

        return response()->json([
            'id' => $session->id,
            'title' => $session->title,
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
}
