<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\ClubMembership;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index($sessionId)
    {
        $attendances = Attendance::with('user.member')
            ->where('attendance_session_id', $sessionId)
            ->get();

        return response()->json($attendances);
    }



    public function updateStatus(Request $request, $sessionId, $userId)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:present,absent,late,excuse',
        ]);

        $attendance = Attendance::updateOrCreate(
            [
                'attendance_session_id' => $sessionId,
                'user_id' => $userId,
            ],
            [
                'status' => $validated['status'],
            ]
        );

        $session = AttendanceSession::findOrFail($sessionId);
        $clubId = $session->club_id;

        $membership = ClubMembership::where('user_id', $userId)
            ->where('club_id', $clubId)
            ->first();

        if ($membership) {

            $lastThreeStatuses = Attendance::where('user_id', $userId)
                ->whereHas('session', function ($query) use ($clubId) {
                    $query->where('club_id', $clubId);
                })
                ->orderBy('created_at', 'desc')
                ->take(3)
                ->pluck('status')
                ->toArray();

            if ($validated['status'] === 'present') {
                $membership->update(['activity_status' => 'active']);
            }
            elseif (
                count($lastThreeStatuses) === 3 &&
                collect($lastThreeStatuses)->every(fn($s) => $s === 'absent')
            ) {
                $membership->update(['activity_status' => 'inactive']);
            }
        }

        return response()->json([
            'message' => 'Status updated successfully',
            'attendance' => $attendance,
        ]);
    }



    public function memberAttendances($userId, $clubId)
    {
        $attendances = Attendance::with('session')
            ->where('user_id', $userId)
            ->whereHas('session', function ($query) use ($clubId) {
                $query->where('club_id', $clubId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($attendances);
    }
}
