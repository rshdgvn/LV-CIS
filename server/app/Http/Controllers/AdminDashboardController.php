<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Club;
use App\Models\Event;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();
        $startOfMonth = Carbon::now()->startOfMonth();

        // ✅ TOTAL CLUBS
        $totalClubs = Club::count();
        $clubsThisMonth = Club::where('created_at', '>=', $startOfMonth)->count();

        // ✅ UPCOMING EVENTS
        $upcomingEvents = Event::where('status', 'upcoming')->count();
        $upcomingYesterday = Event::where('status', 'upcoming')
            ->whereDate('created_at', $yesterday)
            ->count();

        // ✅ TOTAL USERS
        $totalUsers = User::count();
        $usersYesterday = User::whereDate('created_at', $yesterday)->count();

        // ✅ ACTIVE MEMBERS
        $activeMembers = User::whereHas('clubMemberships', function ($q) {
            $q->where('status', 'approved')
                ->where('activity_status', 'active');
        })->count();

        $activeYesterday = User::whereHas('clubMemberships', function ($q) use ($yesterday) {
            $q->where('status', 'approved')
                ->where('activity_status', 'active')
                ->whereDate('created_at', $yesterday);
        })->count();

        return response()->json([
            'cards' => [
                [
                    'title' => 'Total Clubs',
                    'value' => $totalClubs,
                    'delta' => '+' . $clubsThisMonth,
                    'deltaLabel' => 'this month'
                ],
                [
                    'title' => 'Upcoming Events',
                    'value' => $upcomingEvents,
                    'delta' => '+' . $upcomingYesterday,
                    'deltaLabel' => 'since yesterday'
                ],
                [
                    'title' => 'Total Users',
                    'value' => $totalUsers,
                    'delta' => '+' . $usersYesterday,
                    'deltaLabel' => 'since yesterday'
                ],
                [
                    'title' => 'Active Members',
                    'value' => $activeMembers,
                    'delta' => '+' . $activeYesterday,
                    'deltaLabel' => 'since yesterday'
                ],
            ]
        ]);
    }

    public function fetchActiveClubMembers()
    {
        // FIX: Changed wherePivot to standard where referencing the table explicitly
        $clubs = Club::withCount([
            'users as total_members' => function ($q) {
                $q->where('club_memberships.status', 'approved');
            },
            'users as active_members' => function ($q) {
                $q->where('club_memberships.status', 'approved')
                    ->where('club_memberships.activity_status', 'active');
            },
        ])->get();

        $data = $clubs->map(function ($club) {
            $percentage = $club->total_members > 0
                ? round(($club->active_members / $club->total_members) * 100)
                : 0;

            return [
                'name'  => $club->name,
                'value' => $percentage,
            ];
        });

        return response()->json([
            'data' => $data
        ]);
    }

    public function fetchAttendanceChart(Request $request)
    {
        $filter = $request->input('filter', 'weekly');
        $data = [];

        if ($filter === 'weekly') {
            // --- WEEKLY LOGIC (Days of Week) ---
            $startOfWeek = Carbon::now()->startOfWeek();

            for ($i = 0; $i < 7; $i++) {
                $date = $startOfWeek->copy()->addDays($i);

                $stats = Attendance::join('attendance_sessions', 'attendances.attendance_session_id', '=', 'attendance_sessions.id')
                    ->whereDate('attendance_sessions.date', $date)
                    ->selectRaw("
                        COALESCE(SUM(CASE WHEN attendances.status = 'present' THEN 1 ELSE 0 END), 0) as present,
                        COALESCE(SUM(CASE WHEN attendances.status = 'absent' THEN 1 ELSE 0 END), 0) as absent
                    ")
                    ->first();

                $data[] = [
                    'name' => $date->format('D'), // Mon, Tue...
                    'full_date' => $date->format('Y-m-d'),
                    'present' => (int) $stats->present,
                    'absent' => (int) $stats->absent,
                ];
            }
        } elseif ($filter === 'monthly') {
            // --- MONTHLY LOGIC (Weeks of Month) ---
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();
            $currentDate = $startOfMonth->copy();
            $weekCounter = 1;

            while ($currentDate->lte($endOfMonth)) {
                $endOfWeek = $currentDate->copy()->endOfWeek();

                if ($endOfWeek->gt($endOfMonth)) {
                    $endOfWeek = $endOfMonth->copy();
                }

                $stats = Attendance::join('attendance_sessions', 'attendances.attendance_session_id', '=', 'attendance_sessions.id')
                    ->whereBetween('attendance_sessions.date', [$currentDate, $endOfWeek])
                    ->selectRaw("
                        COALESCE(SUM(CASE WHEN attendances.status = 'present' THEN 1 ELSE 0 END), 0) as present,
                        COALESCE(SUM(CASE WHEN attendances.status = 'absent' THEN 1 ELSE 0 END), 0) as absent
                    ")
                    ->first();

                $data[] = [
                    'name' => 'Week ' . $weekCounter,
                    'present' => (int) $stats->present,
                    'absent' => (int) $stats->absent,
                ];

                $currentDate = $endOfWeek->addDay();
                $weekCounter++;
            }
        } elseif ($filter === 'yearly') {
            // --- YEARLY LOGIC (Months of Year) ---
            $currentYear = Carbon::now()->year;

            for ($month = 1; $month <= 12; $month++) {
                // Create a date object for the first day of that month
                $date = Carbon::createFromDate($currentYear, $month, 1);

                $stats = Attendance::join('attendance_sessions', 'attendances.attendance_session_id', '=', 'attendance_sessions.id')
                    ->whereYear('attendance_sessions.date', $currentYear)
                    ->whereMonth('attendance_sessions.date', $month)
                    ->selectRaw("
                        COALESCE(SUM(CASE WHEN attendances.status = 'present' THEN 1 ELSE 0 END), 0) as present,
                        COALESCE(SUM(CASE WHEN attendances.status = 'absent' THEN 1 ELSE 0 END), 0) as absent
                    ")
                    ->first();

                $data[] = [
                    'name' => $date->format('M'), 
                    'present' => (int) $stats->present,
                    'absent' => (int) $stats->absent,
                ];
            }
        }

        return response()->json(['data' => $data]);
    }
}
