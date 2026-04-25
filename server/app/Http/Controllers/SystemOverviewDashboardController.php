<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Club;
use App\Models\Event;
use App\Models\ClubMembership;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SystemOverviewDashboardController extends Controller
{
    private function ensureAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized. Admins only.');
        }
    }

    // ==========================================
    // OVERVIEW METRIC 1: CLUBS
    // ==========================================
    public function getClubsOverview(Request $request)
    {
        $this->ensureAdmin($request);

        $totalClubs = Club::count();
        $recentClubsCount = Club::where('created_at', '>=', now()->subMonths(6))->count();

        return response()->json([
            'total' => $totalClubs,
            'trend_text' => "+{$recentClubsCount} This Semester"
        ]);
    }

    // ==========================================
    // OVERVIEW METRIC 2: ENGAGEMENT
    // ==========================================
    public function getEngagementOverview(Request $request)
    {
        $this->ensureAdmin($request);

        // Filter out admins globally from attendance counts
        $totalAttendances = Attendance::whereHas('user', function($q) {
            $q->where('role', '!=', 'admin');
        })->count();

        $positiveAttendances = Attendance::whereIn('status', ['present', 'late'])
            ->whereHas('user', function($q) {
                $q->where('role', '!=', 'admin');
            })->count();
        
        $overallEngagement = $totalAttendances > 0 
            ? round(($positiveAttendances / $totalAttendances) * 100) 
            : 0;

        $lastMonthStart = now()->subMonth()->startOfMonth()->format('Y-m-d');
        $lastMonthEnd = now()->subMonth()->endOfMonth()->format('Y-m-d');
        
        // Accurate month check ensuring 'admin' roles aren't counted
        $lastMonthStats = DB::table('attendances')
            ->join('attendance_sessions', 'attendances.attendance_session_id', '=', 'attendance_sessions.id')
            ->join('users', 'attendances.user_id', '=', 'users.id') // Join users to filter out admins
            ->where('users.role', '!=', 'admin')
            ->whereBetween('attendance_sessions.date', [$lastMonthStart, $lastMonthEnd])
            ->selectRaw('count(*) as total, sum(case when attendances.status in ("present", "late") then 1 else 0 end) as positive')
            ->first();

        $lastMonthEngagement = $lastMonthStats->total > 0 
            ? round(($lastMonthStats->positive / $lastMonthStats->total) * 100, 1) 
            : 0;

        $trendDiff = round($overallEngagement - $lastMonthEngagement, 1);
        $trendSign = $trendDiff >= 0 ? '+' : '';

        return response()->json([
            'percentage' => $overallEngagement,
            'target' => 85, 
            'trend_text' => "{$trendSign}{$trendDiff}% vs Last Month"
        ]);
    }

    // ==========================================
    // LINE CHART: ATTENDANCE TREND
    // ==========================================
    public function getAttendanceTrend(Request $request)
    {
        $this->ensureAdmin($request);

        $chartData = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            
            // Accurate filtering to ensure admins aren't artificially raising the trend
            $count = DB::table('attendances')
                ->join('attendance_sessions', 'attendances.attendance_session_id', '=', 'attendance_sessions.id')
                ->join('users', 'attendances.user_id', '=', 'users.id') // Join users
                ->where('users.role', '!=', 'admin') // Exclude admins
                ->whereIn('attendances.status', ['present', 'late'])
                ->whereYear('attendance_sessions.date', $month->year)
                ->whereMonth('attendance_sessions.date', $month->month)
                ->count();

            $chartData[] = [
                'label' => strtoupper($month->format('M')), 
                'value' => $count
            ];
        }

        return response()->json($chartData);
    }

    // ==========================================
    // PIE CHARTS & GENERAL OVERVIEW
    // ==========================================
    public function getAdditionalStats(Request $request)
    {
        $this->ensureAdmin($request);

        // STRICT BASE QUERY: Only members and officers. Excludes 'adviser' pivot role and 'admin' user role.
        $realMemberships = ClubMembership::where('club_memberships.status', 'approved')
            ->whereIn('club_memberships.role', ['member', 'officer']) // Excludes advisers
            ->whereHas('user', function ($query) {
                $query->where('role', '!=', 'admin'); // Excludes admins
            }); 
            
        // 1. Overview Metric
        $totalRealStudents = (clone $realMemberships)->distinct('user_id')->count('user_id');
        $activeEvents = Event::whereIn('status', ['upcoming', 'ongoing'])->count();

        // 2. Roles Pie Chart (Members vs Officers)
        $roleCounts = (clone $realMemberships)
            ->selectRaw('role, count(*) as count')
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        // 3. Activity Pie Chart (Active vs Inactive)
        $activityCounts = (clone $realMemberships)
            ->selectRaw('activity_status, count(*) as count')
            ->groupBy('activity_status')
            ->pluck('count', 'activity_status')
            ->toArray();

        return response()->json([
            'overview' => [
                'total_real_students' => $totalRealStudents,
                'active_events' => $activeEvents
            ],
            'roles_pie_chart' => [
                'total' => array_sum($roleCounts),
                'data' => [
                    [
                        'value' => $roleCounts['member'] ?? 0, 
                        'text' => 'Members'
                    ],
                    [
                        'value' => $roleCounts['officer'] ?? 0, 
                        'text' => 'Officers'
                    ]
                ]
            ],
            'activity_pie_chart' => [
                'total' => array_sum($activityCounts),
                'data' => [
                    [
                        'value' => $activityCounts['active'] ?? 0, 
                        'text' => 'Active'
                    ],
                    [
                        'value' => $activityCounts['inactive'] ?? 0, 
                        'text' => 'Inactive'
                    ]
                ]
            ]
        ]);
    }
}