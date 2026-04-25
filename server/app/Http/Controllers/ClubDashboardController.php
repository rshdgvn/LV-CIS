<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\ClubMembership;
use App\Models\Event;
use App\Models\AttendanceSession;
use App\Models\Attendance;
use App\Models\EventTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClubDashboardController extends Controller
{
    // ==========================================
    // MANAGER / ADMIN ENDPOINTS (Club-Specific View)
    // ==========================================

    public function getManagerStats(Club $club)
    {
        // 1. Total Members (Strictly excluding 'admin' users and 'adviser' roles)
        $totalMembers = $club->users()
            ->wherePivot('status', 'approved')
            ->wherePivot('role', '!=', 'adviser')
            ->where('users.role', '!=', 'admin')
            ->count();
        
        $pendingRequests = ClubMembership::where('club_id', $club->id)
            ->where('status', 'pending')
            ->where('role', '!=', 'adviser')
            ->whereHas('user', function ($query) {
                $query->where('role', '!=', 'admin');
            })
            ->count();

        $activeCount = $club->users()
            ->wherePivot('status', 'approved')
            ->wherePivot('role', '!=', 'adviser')
            ->where('users.role', '!=', 'admin')
            ->wherePivot('activity_status', 'active')
            ->count();

        $inactiveCount = $club->users()
            ->wherePivot('status', 'approved')
            ->wherePivot('role', '!=', 'adviser')
            ->where('users.role', '!=', 'admin')
            ->wherePivot('activity_status', 'inactive')
            ->count();

        return response()->json([
            'total_members' => $totalMembers,
            'pending_requests' => $pendingRequests,
            'engagement_rate' => $totalMembers > 0 ? round(($activeCount / $totalMembers) * 100) : 0,
            // Added Activity Pie Chart specifically for the Manager view
            'activity_pie_chart' => [
                'total' => $activeCount + $inactiveCount,
                'data' => [
                    [
                        'value' => $activeCount, 
                        'text' => 'Active'
                    ],
                    [
                        'value' => $inactiveCount, 
                        'text' => 'Inactive'
                    ]
                ]
            ]
        ]);
    }

    public function getManagerInsights(Club $club)
    {
        // 1. Event Pipeline
        $eventStats = Event::where('club_id', $club->id)
            ->selectRaw("status, count(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $upcoming = $eventStats['upcoming'] ?? 0;
        $ongoing = $eventStats['ongoing'] ?? 0;
        $completed = $eventStats['completed'] ?? 0;

        // 2. Member Demographics (Strictly excluding 'admin' users and 'adviser' roles)
        $demographics = DB::table('club_memberships')
            ->join('members', 'club_memberships.user_id', '=', 'members.user_id')
            ->join('users', 'club_memberships.user_id', '=', 'users.id') // Join users to filter admin
            ->where('club_memberships.club_id', $club->id)
            ->where('club_memberships.status', 'approved')
            ->where('club_memberships.role', '!=', 'adviser')
            ->where('users.role', '!=', 'admin')
            ->whereNotNull('members.course')
            ->select('members.course', DB::raw('count(*) as count'))
            ->groupBy('members.course')
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->course,
                    'value' => $item->count
                ];
            });

        return response()->json([
            'pipeline_title' => 'Event Pipeline Health',
            'events' => [
                'upcoming' => $upcoming,
                'ongoing' => $ongoing,
                'completed' => $completed,
                'total' => $upcoming + $ongoing + $completed
            ],
            'demographics' => $demographics
        ]);
    }

    public function getManagerAttendanceTrend(Club $club)
    {
        // Get last 5 sessions to show trend (excluding admins from counts just to be strictly accurate)
        $sessions = AttendanceSession::where('club_id', $club->id)
            ->withCount(['attendances' => function($q) {
                $q->whereIn('status', ['present', 'late'])
                  ->whereHas('user', function($u) {
                      $u->where('role', '!=', 'admin');
                  }); 
            }])
            ->orderBy('date', 'desc')
            ->take(5)
            ->get()
            ->reverse();

        $data = $sessions->map(fn($s) => [
            'label' => Carbon::parse($s->date)->format('M d'),
            'value' => $s->attendances_count,
        ]);

        return response()->json($data->values());
    }

    // ==========================================
    // MEMBER ENDPOINTS (Standard Student View)
    // ==========================================

    public function getMemberOverview(Club $club)
    {
        $user = Auth::user();
        $membership = ClubMembership::where('club_id', $club->id)
            ->where('user_id', $user->id)
            ->first();

        $totalSessions = AttendanceSession::where('club_id', $club->id)->count();
        $myAttendances = Attendance::where('user_id', $user->id)
            ->whereIn('status', ['present', 'late'])
            ->whereHas('session', function($q) use ($club) {
                $q->where('club_id', $club->id);
            })->count();

        return response()->json([
            'role' => $membership->role ?? 'Member',
            'title' => $membership->officer_title ?? 'Club Member',
            'attendance_rate' => $totalSessions > 0 ? round(($myAttendances / $totalSessions) * 100) : 0,
            'joined_at' => $membership->joined_at,
        ]);
    }

    public function getMemberTasks(Club $club)
    {
        $user = Auth::user();
        
        $membership = ClubMembership::where('club_id', $club->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$membership) return response()->json([]);

        $tasks = EventTask::whereHas('assignments', function($q) use ($membership) {
            $q->where('club_membership_id', $membership->id);
        })
        ->where('status', '!=', 'completed')
        ->with('event:id,title')
        ->get();

        return response()->json($tasks);
    }

    public function getMemberUpcomingEvents(Club $club)
    {
        $today = now()->format('Y-m-d');

        $events = Event::where('club_id', $club->id)
            ->whereIn('status', ['upcoming', 'ongoing']) 
            ->whereHas('detail', function($query) use ($today) {
                $query->where('event_date', '>=', $today);
            })
            ->with('detail')
            ->get();

        $formattedEvents = $events->map(function ($event) use ($today) {
            $detail = $event->detail;
            
            $eventDate = $detail && $detail->event_date ? $detail->event_date->format('Y-m-d') : null;
            
            return [
                'id' => $event->id,
                'title' => $event->title,
                'description' => $event->description,
                'cover_image' => $event->cover_image,
                'date' => $eventDate,
                'venue' => $detail ? $detail->venue : 'TBA',
                'is_ongoing' => $eventDate === $today,
            ];
        })->sortBy('date')->values();

        return response()->json($formattedEvents);
    }
}