<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\ClubMembership;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceSessionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $isAdmin = $user->role === 'admin';
        $clubId = $request->query('club_id');

        $query = AttendanceSession::with(['club', 'event'])->orderBy('date', 'desc');

        $totalMembers = 0;
        $activeMembers = 0;
        $inactiveMembers = 0;

        if ($clubId) {
            // Check membership for specific club if not admin
            if (!$isAdmin) {
                $isMember = ClubMembership::where('user_id', $user->id)
                    ->where('club_id', $clubId)
                    ->where('status', 'approved')
                    ->exists();

                if (!$isMember) {
                    return response()->json(['error' => 'You are not a member of this club'], 403);
                }
            }

            // ✨ NEW: Get this club's sessions AND General Sessions (null club_id) ✨
            $query->where(function ($q) use ($clubId) {
                $q->where('club_id', $clubId)
                    ->orWhereNull('club_id');
            });

            // YOUR EXACT ANALYTICS LOGIC
            $userClub = $user->clubs()->where('club_id', $clubId)->first();

            if ($userClub) {
                $totalMembers = $userClub->users()
                    ->wherePivot('status', 'approved')
                    ->wherePivot('role', '!=', 'adviser') // Exclude advisers from count
                    ->count();

                $activeMembers = $userClub->users()
                    ->wherePivot('status', 'approved')
                    ->wherePivot('role', '!=', 'adviser') // Exclude advisers from count
                    ->wherePivot('activity_status', 'active')
                    ->count();

                $inactiveMembers = $userClub->users()
                    ->wherePivot('status', 'approved')
                    ->wherePivot('role', '!=', 'adviser') // Exclude advisers from count
                    ->wherePivot('activity_status', 'inactive')
                    ->count();
            } elseif ($isAdmin) {
                // Fallback just in case an Admin checks a club they aren't personally a member of
                $totalMembers = ClubMembership::where('club_id', $clubId)->where('status', 'approved')->where('role', '!=', 'adviser')->count();
                $activeMembers = ClubMembership::where('club_id', $clubId)->where('status', 'approved')->where('role', '!=', 'adviser')->where('activity_status', 'active')->count();
                $inactiveMembers = ClubMembership::where('club_id', $clubId)->where('status', 'approved')->where('role', '!=', 'adviser')->where('activity_status', 'inactive')->count();
            }
        } else {
            // God Mode / General Mode
            if (!$isAdmin) {
                // Standard user requests without club_id -> show general sessions only
                $query->whereNull('club_id');
            } else {
                // Admin global stats (no specific club)
                $totalMembers = ClubMembership::where('status', 'approved')->where('role', '!=', 'adviser')->count();
                $activeMembers = ClubMembership::where('status', 'approved')->where('role', '!=', 'adviser')->where('activity_status', 'active')->count();
                $inactiveMembers = ClubMembership::where('status', 'approved')->where('role', '!=', 'adviser')->where('activity_status', 'inactive')->count();
            }
        }

        $sessions = $query->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'title' => $s->event ? $s->event->title : ($s->title ?? 'Untitled Session'),
                'venue' => $s->venue ?? optional($s->event)->venue ?? 'N/A',
                'date' => $s->date,
                'is_open' => true, // Enforced to always be open
                'club' => $s->club ? [
                    'id' => $s->club->id,
                    'name' => $s->club->name,
                ] : null,
                'event' => $s->event ? [
                    'id' => $s->event->id,
                    'title' => $s->event->title,
                ] : null,
            ];
        });

        $analytics = [
            'total_members' => $totalMembers,
            'active_members' => $activeMembers,
            'inactive_members' => $inactiveMembers
        ];

        return response()->json([
            'sessions' => $sessions,
            'analytics' => $analytics
        ]);
    }

    public function show(Request $request, $id)
    {
        $session = AttendanceSession::with([
            'club.approvedUsers.member',
            'event',
            'attendances.user.member'
        ])->find($id);

        if (!$session) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        $authUser = $request->user();
        $isAdmin = $authUser && $authUser->role === 'admin';

        $users = [];

        if ($session->club_id && $session->club && $session->club->approvedUsers) {
            $users = $session->club->approvedUsers
                ->filter(fn($user) => $user->pivot->role !== 'adviser')
                ->map(function ($user) use ($session) {
                    $attendance = $session->attendances->where('user_id', $user->id)->first();
                    $member = $user->member;
                    return [
                        'user_id' => $user->id,
                        'name'    => $user->first_name . ' ' . $user->last_name,
                        'avatar'  => $user->avatar,
                        'course'  => $member ? ($member->course . ' ' . $member->year_level) : 'N/A',
                        'status'  => $attendance?->status ?? null,
                    ];
                })
                ->values();
        }
        else {
            if ($isAdmin) {
                $memberships = ClubMembership::with('user.member')
                    ->where('status', 'approved')
                    ->where('role', '!=', 'adviser')
                    ->get()
                    ->unique('user_id');

                $users = $memberships->map(function ($membership) use ($session) {
                    $user = $membership->user;
                    if (!$user) return null;
                    $attendance = $session->attendances->where('user_id', $user->id)->first();
                    $member = $user->member;
                    return [
                        'user_id' => $user->id,
                        'name'    => $user->first_name . ' ' . $user->last_name,
                        'avatar'  => $user->avatar,
                        'course'  => $member ? ($member->course . ' ' . $member->year_level) : 'N/A',
                        'status'  => $attendance?->status ?? null,
                    ];
                })->filter()->values();
            } else {
                $membership = ClubMembership::where('user_id', $authUser->id)
                    ->where('status', 'approved')
                    ->first();

                if ($membership) {
                    $clubMembers = ClubMembership::with('user.member')
                        ->where('club_id', $membership->club_id)
                        ->where('status', 'approved')
                        ->where('role', '!=', 'adviser')
                        ->get();

                    $users = $clubMembers->map(function ($cm) use ($session) {
                        $user = $cm->user;
                        if (!$user) return null;
                        $attendance = $session->attendances->where('user_id', $user->id)->first();
                        $member = $user->member;
                        return [
                            'user_id' => $user->id,
                            'name'    => $user->first_name . ' ' . $user->last_name,
                            'avatar'  => $user->avatar,
                            'course'  => $member ? ($member->course . ' ' . $member->year_level) : 'N/A',
                            'status'  => $attendance?->status ?? null,
                        ];
                    })->filter()->values();
                }
            }
        }

        return response()->json([
            'id'      => $session->id,
            'title'   => $session->event ? $session->event->title : ($session->title ?? 'Untitled Session'),
            'venue'   => $session->venue ?? optional($session->event)->venue ?? 'N/A',
            'date'    => $session->date,
            'is_open' => true,
            'club'    => $session->club ? ['id' => $session->club->id, 'name' => $session->club->name] : null,
            'event'   => $session->event ? ['id' => $session->event->id, 'title' => $session->event->title] : null,
            'members' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $clubId = $request->club_id;

        // Strict validation for Officers
        if (!$isAdmin) {
            if (!$clubId) {
                return response()->json(['error' => 'Officers must specify a club_id.'], 403);
            }

            $isOfficer = ClubMembership::where('user_id', $user->id)
                ->where('club_id', $clubId)
                ->where('role', 'officer')
                ->where('status', 'approved')
                ->exists();

            if (!$isOfficer) {
                return response()->json(['error' => 'Only officers can create sessions for this club.'], 403);
            }
        }

        $request->validate([
            'club_id' => 'nullable|exists:clubs,id',
            'title' => 'required|string|max:255',
            'venue' => 'nullable|string|max:255',
            'date' => 'required|date',
        ]);

        if ($clubId) {
            $existing = AttendanceSession::where('club_id', $clubId)
                ->where('date', $request->date)
                ->where('title', $request->title)
                ->first();

            if ($existing) {
                return response()->json([
                    'error' => 'A session with the same title and date already exists for this club'
                ], 409);
            }
        }

        $session = AttendanceSession::create([
            'club_id' => $clubId,
            'created_by' => $user->id,
            'title' => $request->title,
            'venue' => $request->venue,
            'date' => $request->date,
            'is_open' => true, // Forced to open
        ]);

        return response()->json([
            'message' => 'Attendance session created successfully',
            'session' => $session
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $session = AttendanceSession::find($id);
        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        // Strict validation for Officers
        if (!$isAdmin) {
            if (!$session->club_id) {
                return response()->json(['error' => 'Only admins can edit general sessions.'], 403);
            }

            $isOfficer = ClubMembership::where('user_id', $user->id)
                ->where('club_id', $session->club_id)
                ->where('role', 'officer')
                ->where('status', 'approved')
                ->exists();

            if (!$isOfficer) {
                return response()->json(['error' => 'You are not an officer of this club.'], 403);
            }
        }

        $request->validate([
            'title' => 'nullable|string|max:255',
            'venue' => 'nullable|string|max:255',
            'date' => 'nullable|date',
        ]);

        $session->update([
            'title' => $request->title ?? $session->title,
            'venue' => $request->venue ?? $session->venue,
            'date' => $request->date ?? $session->date,
            'is_open' => true, // Forced to open
        ]);

        return response()->json([
            'message' => 'Attendance session updated successfully',
            'session' => $session
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $session = AttendanceSession::find($id);
        if (!$session) {
            return response()->json(['error' => 'Session not found'], 404);
        }

        // Strict validation for Officers
        if (!$isAdmin) {
            if (!$session->club_id) {
                return response()->json(['error' => 'Only admins can delete general sessions.'], 403);
            }

            $isOfficer = ClubMembership::where('user_id', $user->id)
                ->where('club_id', $session->club_id)
                ->where('role', 'officer')
                ->where('status', 'approved')
                ->exists();

            if (!$isOfficer) {
                return response()->json(['error' => 'You are not an officer of this club.'], 403);
            }
        }

        $session->delete();

        return response()->json([
            'message' => 'Attendance session deleted successfully'
        ]);
    }
}
