<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Club;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;

class SystemOverviewDashboardController extends Controller
{

    private function ensureAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(403, 'Unauthorized. Admins only.');
        }
    }


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

    public function getEngagementOverview(Request $request)
    {
        $this->ensureAdmin($request);

        $totalAttendances = Attendance::count();
        $positiveAttendances = Attendance::whereIn('status', ['present', 'late'])->count();
        $overallEngagement = $totalAttendances > 0 
            ? round(($positiveAttendances / $totalAttendances) * 100) 
            : 0;

        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();
        
        $lastMonthTotal = Attendance::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
        $lastMonthPositive = Attendance::whereIn('status', ['present', 'late'])
            ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
            ->count();
            
        $lastMonthEngagement = $lastMonthTotal > 0 
            ? round(($lastMonthPositive / $lastMonthTotal) * 100, 1) 
            : 0;

        $trendDiff = round($overallEngagement - $lastMonthEngagement, 1);
        $trendSign = $trendDiff >= 0 ? '+' : '';

        return response()->json([
            'percentage' => $overallEngagement,
            'target' => 85, 
            'trend_text' => "{$trendSign}{$trendDiff}% vs Last Month"
        ]);
    }


    public function getAttendanceTrend(Request $request)
    {
        $this->ensureAdmin($request);

        $chartData = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            
            $count = Attendance::whereIn('status', ['present', 'late'])
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();

            $chartData[] = [
                'label' => strtoupper($month->format('M')), 
                'value' => $count
            ];
        }

        return response()->json($chartData);
    }


    public function getAdditionalStats(Request $request)
    {
        $this->ensureAdmin($request);

        $totalStudents = User::where('role', 'user')->count();
        $activeEvents = Event::whereIn('status', ['upcoming', 'ongoing'])->count();

        return response()->json([
            'total_students' => $totalStudents,
            'active_events' => $activeEvents
        ]);
    }
}