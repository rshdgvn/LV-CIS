<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ClubMembership;
use Illuminate\Support\Facades\Auth;
use App\Models\Event;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function pendingApplicants()
    {
        $user = Auth::user();

        // 1. Get IDs of clubs where the user is an officer (and approved)
        // Adjust the role names ('officer', 'president') to match your database values exactly
        $officerClubIds = $user->clubMemberships()
            ->where('status', 'approved')
            ->whereIn('role', ['officer', 'president'])
            ->pluck('club_id');

        // 2. If user manages no clubs, return early
        if ($officerClubIds->isEmpty()) {
            return response()->json([
                'status' => 'success',
                'is_officer' => false,
                'data' => []
            ]);
        }

        // 3. Fetch pending requests strictly for those clubs
        $pending = ClubMembership::whereIn('club_id', $officerClubIds)
            ->where('status', 'pending')
            ->with(['user:id,first_name,last_name,avatar', 'club:id,name']) // Eager load specific fields
            ->latest()
            ->take(5) // Limit for dashboard widget
            ->get();

        // 4. Format for frontend
        $data = $pending->map(function ($item) {
            return [
                'id' => $item->id,
                'user_id' => $item->user_id,
                'name' => trim($item->user->first_name . ' ' . $item->user->last_name),
                'avatar' => $item->user->avatar, // Ensure this accessor/column exists
                'club_name' => $item->club->name,
                'club_id' => $item->club->id,
                'requested_role' => $item->requested_role ?? 'Member',
                'created_at' => $item->created_at->diffForHumans(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'is_officer' => true,
            'data' => $data
        ]);
    }

    public function upcomingEvents()
    {
        $user = Auth::user();

        $joinedClubIds = $user->clubs()
            ->wherePivot('status', 'approved')
            ->pluck('clubs.id');

        $events = Event::whereIn('club_id', $joinedClubIds)
            ->where('status', 'upcoming')
            ->with(['club:id,name,logo', 'detail']) 
            ->get()
            ->sortBy(function ($event) {
                return $event->detail->event_date ?? $event->created_at;
            })
            ->values();

        $data = $events->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'club_name' => $event->club->name,
                'logo' => $event->club->logo_url, 
                'date' => Carbon::parse($event->detail->event_date)->format('M d, Y'),
                'mode' => $event->detail->event_mode ?? 'N/A',
                'status' => ucfirst($event->status),
            ];
        });

        return response()->json(['data' => $data]);
    }
}
