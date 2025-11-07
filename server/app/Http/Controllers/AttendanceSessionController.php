<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AttendanceSession;
use App\Models\ClubMembership;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AttendanceSessionController extends Controller
{
    public function index(Request $request)
    {
        try {
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
                        // ✅ Safe venue access (avoid null property error)
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
        } catch (\Exception $e) {
            // ✅ Log full error for debugging
            Log::error('AttendanceSessionController@index failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to load attendance sessions',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
