<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\ClubMembership;
use Illuminate\Http\Request;

class MobileDashboardController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(["test" => "test"]);
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'active_members' => 0,
                    'inactive_members' => 0,
                ]);
            }

            $approvedClubIds = ClubMembership::where('user_id', $user->id)
                ->where('status', 'approved')
                ->pluck('club_id');

            $activeMembers = ClubMembership::whereIn('club_id', $approvedClubIds)
                ->where('status', 'approved')
                ->where('activity_status', 'active')
                ->distinct('user_id')
                ->count('user_id');

            $inactiveMembers = ClubMembership::whereIn('club_id', $approvedClubIds)
                ->where('status', 'approved')
                ->where('activity_status', 'inactive')
                ->distinct('user_id')
                ->count('user_id');

            return response()->json([
                'active_members' => $activeMembers,
                'inactive_members' => $inactiveMembers,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()], 500);
        }
    }

    public function membersHealth(Request $request, $clubId)
    {
        try {
            $baseQuery = ClubMembership::where('club_id', $clubId)->where('status', 'approved');

            return response()->json([
                'total_members' => (clone $baseQuery)->count(),
                'active_members' => (clone $baseQuery)->where('activity_status', 'active')->count(),
                'inactive_members' => (clone $baseQuery)->where('activity_status', 'inactive')->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage(), 'line' => $e->getLine()], 500);
        }
    }

    public function pendingMembers(Request $request, $clubId)
    {
        try {
            $pendingMembers = ClubMembership::where('club_id', $clubId)
                ->where('status', 'pending')
                ->count();

            return response()->json([
                'pending_members' => $pendingMembers,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage(), 'line' => $e->getLine()], 500);
        }
    }

    public function attendanceRate(Request $request, $clubId)
    {
        try {
            $sessionIds = AttendanceSession::where('club_id', $clubId)->pluck('id');

            $totalAttendances = Attendance::whereIn('attendance_session_id', $sessionIds)->count();
            $presentAttendances = Attendance::whereIn('attendance_session_id', $sessionIds)
                ->where('status', 'present')
                ->count();

            $attendanceRate = $totalAttendances > 0
                ? round(($presentAttendances / $totalAttendances) * 100, 1)
                : 0;

            return response()->json([
                'attendance_rate' => $attendanceRate,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage(), 'line' => $e->getLine()], 500);
        }
    }

    public function monthlyTrend(Request $request, $clubId)
    {
        try {
            $sessions = AttendanceSession::where('club_id', $clubId)
                ->where('date', '>=', now()->subMonths(6)->startOfMonth())
                ->get();

            $monthlyTrend = $sessions->groupBy(function ($session) {
                    return \Carbon\Carbon::parse($session->date)->format('Y-m');
                })
                ->map(function ($groupedSessions, $month) {
                    $sessionIds = $groupedSessions->pluck('id');
                    $total = Attendance::whereIn('attendance_session_id', $sessionIds)->count();
                    $present = Attendance::whereIn('attendance_session_id', $sessionIds)
                        ->where('status', 'present')
                        ->count();

                    $label = \Carbon\Carbon::parse($month . '-01')->format('M');

                    return [
                        'label' => strtoupper($label),
                        'value' => $total > 0 ? round(($present / $total) * 100, 1) : 0,
                    ];
                })
                ->values();

            return response()->json([
                'monthly_trend' => $monthlyTrend,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage(), 'line' => $e->getLine()], 500);
        }
    }
}