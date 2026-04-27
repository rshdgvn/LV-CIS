<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\ClubMembership;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\AttendanceNotifications\AttendanceMarked;
use App\Notifications\AttendanceNotifications\ActivityStatusChanged;

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

        $authUser = Auth::user();
        $isAdmin = $authUser->role === 'admin';

        $session = AttendanceSession::findOrFail($sessionId);
        $clubId = $session->club_id;

        if (!$isAdmin) {
            $authMembership = ClubMembership::where('user_id', $authUser->id)
                ->where('club_id', $clubId)
                ->first();

            if (!$authMembership || $authMembership->role === 'member') {
                return response()->json([
                    'message' => 'You are not authorized to update attendance.',
                ], 403);
            }
        }

        $attendance = Attendance::updateOrCreate(
            [
                'attendance_session_id' => $sessionId,
                'user_id' => $userId,
            ],
            [
                'status' => $validated['status'],
            ]
        );

        $targetUser = \App\Models\User::find($userId);
        $actor = Auth::user();
        $club = $clubId ? \App\Models\Club::find($clubId) : null;

        if ($targetUser && $club) {
            $targetUser->notify(new AttendanceMarked($session, $club, $actor, $validated['status']));
        }

        if ($clubId) {
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
                    $wasInactive = $membership->activity_status === 'inactive';
                    $membership->update(['activity_status' => 'active']);
                    if ($wasInactive && $targetUser && $club) {
                        $targetUser->notify(new ActivityStatusChanged($club, 'active'));
                    }
                } elseif (
                    count($lastThreeStatuses) === 3 &&
                    collect($lastThreeStatuses)->every(fn($s) => $s === 'absent')
                ) {
                    $membership->update(['activity_status' => 'inactive']);
                    if ($targetUser && $club) {
                        $targetUser->notify(new ActivityStatusChanged($club, 'inactive'));
                    }
                }
            }
        }

        return response()->json([
            'message' => 'Status updated successfully',
            'attendance' => $attendance,
        ]);
    }

    public function memberAttendances($userId, $clubId)
    {
        $attendances = Attendance::with([
            'session',
            'session.event',
            'session.club',
            'user',
            'user.member',
        ])
            ->where('user_id', $userId)
            ->whereHas('session', function ($query) use ($clubId) {
                $query->where('club_id', $clubId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $membership = ClubMembership::where('user_id', $userId)
            ->where('club_id', $clubId)
            ->first();

        $stats = [
            'present' => $attendances->where('status', 'present')->count(),
            'absent'  => $attendances->where('status', 'absent')->count(),
            'late'    => $attendances->where('status', 'late')->count(),
            'excuse'  => $attendances->where('status', 'excuse')->count(),
        ];

        return response()->json([
            'attendances' => $attendances,
            'stats'       => $stats,
            'user' => [
                'id'         => $membership?->user->id,
                'avatar'     => $membership?->user->avatar,
                'name'       => trim(($membership?->user->first_name ?? '') . ' ' . ($membership?->user->last_name ?? '')),
                'role'       => $membership?->role,
            ],
            'club' => $membership?->club,
        ]);
    }
}