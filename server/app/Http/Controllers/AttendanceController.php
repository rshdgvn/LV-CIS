<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index($sessionId)
    {
        $attendances = Attendance::with('member')
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

        return response()->json([
            'message' => 'Status updated successfully',
            'attendance' => $attendance,
        ]);
    }
}
