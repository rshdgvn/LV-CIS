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
        $totalMembers = $club->users()->wherePivot('status', 'approved')->count();
        
        $pendingRequests = ClubMembership::where('club_id', $club->id)
            ->where('status', 'pending')
            ->count();

        $activeCount = ClubMembership::where('club_id', $club->id)
            ->where('status', 'approved')
            ->where('activity_status', 'active')
            ->count();

        return response()->json([
            'total_members' => $totalMembers,
            'pending_requests' => $pendingRequests,
            'engagement_rate' => $totalMembers > 0 ? round(($activeCount / $totalMembers) * 100) : 0,
        ]);
    }

    /**
     * REPLACED TASKS WITH "CLUB INSIGHTS"
     * Admins/Officers don't need micro-tasks. They need to know the Event Pipeline
     * (is the club active?) and Demographics (who is joining?).
     */
    public function getManagerInsights(Club $club)
    {
        // 1. Event Pipeline (Perfect for replacing the Pie Chart)
        $eventStats = Event::where('club_id', $club->id)
            ->selectRaw("status, count(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $upcoming = $eventStats['upcoming'] ?? 0;
        $ongoing = $eventStats['ongoing'] ?? 0;
        $completed = $eventStats['completed'] ?? 0;

        // 2. Member Demographics (What courses are the members from?)
        $demographics = DB::table('club_memberships')
            ->join('members', 'club_memberships.user_id', '=', 'members.user_id')
            ->where('club_memberships.club_id', $club->id)
            ->where('club_memberships.status', 'approved')
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
        // Get last 5 sessions to show trend
        $sessions = AttendanceSession::where('club_id', $club->id)
            ->withCount(['attendances' => function($q) {
                // Ensure we count both present and late
                $q->whereIn('status', ['present', 'late']); 
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

        // Calculate personal attendance %
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