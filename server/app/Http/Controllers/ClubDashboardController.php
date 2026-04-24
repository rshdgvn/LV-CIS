<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\ClubMembership;
use App\Models\Event;
use App\Models\EventTask;
use App\Models\AttendanceSession;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ClubDashboardController extends Controller
{
    // ==========================================
    // MANAGER ENDPOINTS (Officer/Admin View)
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

    public function getManagerTaskSummary(Club $club)
    {
        // Get the most recent/ongoing event
        $activeEvent = Event::where('club_id', $club->id)
            ->where('status', '!=', 'completed')
            ->latest()
            ->first();

        if (!$activeEvent) {
            return response()->json(['message' => 'No active event found', 'tasks' => []]);
        }

        $taskStats = EventTask::where('event_id', $activeEvent->id)
            ->selectRaw("status, count(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'event_title' => $activeEvent->title,
            'stats' => [
                'pending' => $taskStats['pending'] ?? 0,
                'in_progress' => $taskStats['in_progress'] ?? 0,
                'completed' => $taskStats['completed'] ?? 0,
            ]
        ]);
    }

    public function getManagerAttendanceTrend(Club $club)
    {
        // Get last 5 sessions to show trend
        $sessions = AttendanceSession::where('club_id', $club->id)
            ->withCount(['attendances' => function($q) {
                $q->where('status', 'present')->orWhere('status', 'late');
            }])
            ->orderBy('date', 'desc')
            ->take(5)
            ->get()
            ->reverse();

        $data = $sessions->map(fn($s) => [
            'label' => Carbon::parse($s->date)->format('M d'),
            'value' => $s->attendances_count,
        ]);

        return response()->json($data);
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
        
        // Find membership ID to filter assignments
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
        ->whereHas('sessions', function($query) use ($today) {
            $query->where('date', '>=', $today);
        })
        ->with(['sessions' => function($query) use ($today) {
            $query->where('date', '>=', $today)->orderBy('date', 'asc');
        }])
        ->get();

    $formattedEvents = $events->map(function ($event) use ($today) {
        $firstSession = $event->sessions->first();
        $eventDate = $firstSession ? $firstSession->date : null;
        
        return [
            'id' => $event->id,
            'title' => $event->title,
            'description' => $event->description,
            'cover_image' => $event->cover_image,
            'date' => $eventDate,
            'venue' => $firstSession ? $firstSession->venue : 'TBA',
            'is_ongoing' => $eventDate === $today,
        ];
    })->sortBy('date')->values();

    return response()->json($formattedEvents);
}
}