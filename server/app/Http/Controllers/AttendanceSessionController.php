<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AttendanceSession;
use Illuminate\Support\Facades\Auth;

class AttendanceSessionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $sessions = AttendanceSession::with(['club', 'event'])
            ->whereIn('club_id', $user->memberships()->pluck('club_id'))
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
        $session = AttendanceSession::with(['club', 'event'])->find($id);

        if (!$session) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        return response()->json([
            'id' => $session->id,
            'title' => $session->title,
            'venue' => $session->venue ?? optional($session->event)->venue ?? 'N/A',
            'date' => $session->date,
            'is_open' => (bool) $session->is_open,
            'club' => $session->club,
            'event' => $session->event,
        ]);
    }
}
