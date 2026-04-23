<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Club;
use App\Models\ClubMembership;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MobileDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

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
    }

    public function clubAnalytics(Request $request, $clubId)
    {
        $user = $request->user();

        $membership = ClubMembership::where('user_id', $user->id)
            ->where('club_id', $clubId)
            ->where('status', 'approved')
            ->first();

        if (!$membership) {
            return response()->json(['message' => 'You are not a member of this club.'], 403);
        }

        $club = Club::findOrFail($clubId);

        $totalMembers = ClubMembership::where('club_id', $clubId)
            ->where('status', 'approved')
            ->count();

        $activeMembers = ClubMembership::where('club_id', $clubId)
            ->where('status', 'approved')
            ->where('activity_status', 'active')
            ->count();

        $inactiveMembers = ClubMembership::where('club_id', $clubId)
            ->where('status', 'approved')
            ->where('activity_status', 'inactive')
            ->count();

        $sessionIds = AttendanceSession::where('club_id', $clubId)->pluck('id');

        $totalAttendances = Attendance::whereIn('attendance_session_id', $sessionIds)->count();
        $presentAttendances = Attendance::whereIn('attendance_session_id', $sessionIds)
            ->where('status', 'present')
            ->count();

        $attendanceRate = $totalAttendances > 0
            ? round(($presentAttendances / $totalAttendances) * 100, 1)
            : 0;

        $monthlyTrend = AttendanceSession::where('club_id', $clubId)
            ->where('date', '>=', now()->subMonths(6)->startOfMonth())
            ->select(
                DB::raw("DATE_FORMAT(date, '%Y-%m') as month"),
                DB::raw("DATE_FORMAT(date, '%b') as label"),
                'id'
            )
            ->get()
            ->groupBy('month')
            ->map(function ($sessions) {
                $sessionIds = $sessions->pluck('id');
                $total = Attendance::whereIn('attendance_session_id', $sessionIds)->count();
                $present = Attendance::whereIn('attendance_session_id', $sessionIds)
                    ->where('status', 'present')
                    ->count();

                return [
                    'label' => strtoupper($sessions->first()->label),
                    'value' => $total > 0 ? round(($present / $total) * 100, 1) : 0,
                ];
            })
            ->values();

        return response()->json([
            'club' => [
                'id' => $club->id,
                'name' => $club->name,
                'logo_url' => $club->logo_url,
            ],
            'total_members' => $totalMembers,
            'active_members' => $activeMembers,
            'inactive_members' => $inactiveMembers,
            'attendance_rate' => $attendanceRate,
            'monthly_trend' => $monthlyTrend,
        ]);
    }
}