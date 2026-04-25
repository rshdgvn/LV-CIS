<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventDetail;
use App\Models\AttendanceSession;
use App\Models\ClubMembership;
use Illuminate\Http\Request;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    use AuthorizesRequests;

    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    public function getAllEvents(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user && $user->role === 'admin';
        $clubId = $request->query('club_id');

        $query = Event::with([
            'detail',
            'club:id,name',
            'club.users:id,first_name,last_name,email'
        ])->latest();

        if ($clubId) {
            $query->where(function($q) use ($clubId) {
                $q->where('club_id', $clubId)
                  ->orWhereNull('club_id');
            });
        } elseif (!$isAdmin) {
            $query->whereNull('club_id');
        }

        $events = $query->get();

        $events->transform(function ($event) {
            if ($event->club && $event->club->users) {
                $event->club->users->transform(function ($user) {
                    $user->name = trim($user->first_name . ' ' . $user->last_name);
                    return $user;
                });
            }
            return $event;
        });

        return response()->json($events);
    }

    public function getEventById($id)
    {
        $event = Event::with(['detail', 'club'])->findOrFail($id);
        return response()->json($event);
    }

    public function addEvent(Request $request)
    {
        // Safe null handling
        $clubId = $request->input('club_id');
        if (in_array($clubId, ['null', 'undefined', ''])) {
            $request->merge(['club_id' => null]);
            $clubId = null;
        }

        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        if (!$isAdmin) {
            if (!$clubId) {
                return response()->json(['message' => 'Officers must specify a club.'], 403);
            }

            $isOfficer = ClubMembership::where('user_id', $user->id)
                ->where('club_id', $clubId)
                ->where('role', 'officer')
                ->where('status', 'approved')
                ->exists();

            if (!$isOfficer) {
                return response()->json(['message' => 'Unauthorized. You are not an officer of this club.'], 403);
            }
        }

        try {
            $validated = $request->validate([
                'club_id' => 'nullable',
                'title' => 'required|string|max:255',
                'purpose' => 'nullable|string',
                'description' => 'nullable|string',
                'cover_image' => 'nullable|file|image|max:5120',
                'photos.*' => 'nullable|file|image|max:5120',
                'videos.*' => 'nullable|file|mimetypes:video/mp4,video/quicktime|max:20480',
                'status' => 'required|string|in:upcoming,ongoing,completed',
                'event_date' => 'required|date',
                'event_time' => 'required|string',
                'venue' => 'required|string|max:255',
                'organizer' => 'nullable|string|max:255',
                'contact_person' => 'nullable|string|max:255',
                'contact_email' => 'nullable|email',
                'event_mode' => 'nullable|string',
                'duration' => 'nullable|string|max:255',
            ]);

            $formattedTime = date('H:i:s', strtotime($validated['event_time']));

            DB::beginTransaction();

            try {
                $coverUrl = null;
                if ($request->hasFile('cover_image')) {
                    $coverUrl = $this->cloudinary->upload($request->file('cover_image'), 'events/covers');
                }

                $photoUrls = [];
                if ($request->hasFile('photos')) {
                    foreach ($request->file('photos') as $photo) {
                        $url = $this->cloudinary->upload($photo, 'events/photos');
                        if ($url) $photoUrls[] = $url;
                    }
                }

                $videoUrls = [];
                if ($request->hasFile('videos')) {
                    foreach ($request->file('videos') as $video) {
                        $url = $this->cloudinary->upload($video, 'events/videos');
                        if ($url) $videoUrls[] = $url;
                    }
                }

                $event = Event::create([
                    'club_id' => $validated['club_id'] ?? null,
                    'title' => $validated['title'],
                    'purpose' => $validated['purpose'] ?? 'General Event',
                    'description' => $validated['description'] ?? '',
                    'cover_image' => $coverUrl,
                    'photos' => $photoUrls,
                    'videos' => $videoUrls,
                    'status' => $validated['status'],
                ]);

                EventDetail::create([
                    'event_id' => $event->id,
                    'event_date' => $validated['event_date'],
                    'event_time' => $formattedTime,
                    'venue' => $validated['venue'],
                    'organizer' => $validated['organizer'] ?? 'Admin',
                    'contact_person' => $validated['contact_person'] ?? 'Admin',
                    'contact_email' => $validated['contact_email'] ?? 'admin@cis.com',
                    'event_mode' => $validated['event_mode'] ?? 'face_to_face',
                    'duration' => $validated['duration'] ?? '2 hours',
                ]);

                AttendanceSession::create([
                    'club_id' => $event->club_id,
                    'event_id' => $event->id,
                    'created_by' => $user->id,
                    'title' => $validated['title'] . ' - Attendance',
                    'venue' => $validated['venue'],
                    'date' => $validated['event_date'],
                    'is_open' => true,
                ]);

                DB::commit();

                return response()->json([
                    'message' => 'Event created successfully.',
                    'event' => $event->load('detail'),
                ], 201);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Failed to create event.', 'error' => $e->getMessage()], 500);
        }
    }

    public function updateEvent(Request $request, $id)
    {
        // Safe null handling
        $clubId = $request->input('club_id');
        if (in_array($clubId, ['null', 'undefined', ''])) {
            $request->merge(['club_id' => null]);
            $clubId = null;
        }

        $user = $request->user();
        $isAdmin = $user->role === 'admin';
        $event = Event::findOrFail($id);

        if (!$isAdmin) {
            if (!$event->club_id) {
                return response()->json(['message' => 'Only admins can edit general events.'], 403);
            }

            $isOfficer = ClubMembership::where('user_id', $user->id)
                ->where('club_id', $event->club_id)
                ->where('role', 'officer')
                ->where('status', 'approved')
                ->exists();

            if (!$isOfficer) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        try {
            // FIX: Relaxed validation. 'sometimes' and 'nullable' ensures 
            // the update doesn't crash if the frontend doesn't send these fields!
            $validated = $request->validate([
                'club_id' => 'nullable',
                'title' => 'sometimes|string|max:255',
                'purpose' => 'nullable|string',
                'description' => 'nullable|string',
                'cover_image' => 'nullable',
                'photos.*' => 'nullable',
                'videos.*' => 'nullable',
                'status' => 'nullable|string|in:upcoming,ongoing,completed',
                'event_date' => 'sometimes|date',
                'event_time' => 'sometimes|string',
                'venue' => 'sometimes|string|max:255',
                'organizer' => 'nullable|string|max:255',
                'contact_person' => 'nullable|string|max:255',
                'contact_email' => 'nullable|email',
                'event_mode' => 'nullable|string',
                'duration' => 'nullable|string|max:255',
            ]);

            DB::beginTransaction();

            try {
                $coverUrl = $event->cover_image;
                if ($request->hasFile('cover_image')) {
                    $newCoverUrl = $this->cloudinary->upload($request->file('cover_image'), 'events/covers');
                    if ($newCoverUrl) $coverUrl = $newCoverUrl;
                }

                $event->update([
                    'club_id' => $validated['club_id'] ?? $event->club_id,
                    'title' => $validated['title'] ?? $event->title,
                    'description' => $validated['description'] ?? $event->description,
                    'cover_image' => $coverUrl,
                    'status' => $validated['status'] ?? $event->status,
                ]);

                if ($event->detail && isset($validated['event_date']) && isset($validated['event_time']) && isset($validated['venue'])) {
                    $event->detail->update([
                        'event_date' => $validated['event_date'],
                        'event_time' => date('H:i:s', strtotime($validated['event_time'])),
                        'venue' => $validated['venue'],
                    ]);
                }

                $session = AttendanceSession::where('event_id', $event->id)->first();
                if ($session && isset($validated['event_date']) && isset($validated['venue'])) {
                    $session->update([
                        'title' => ($validated['title'] ?? $event->title) . ' - Attendance',
                        'venue' => $validated['venue'],
                        'date' => $validated['event_date'],
                    ]);
                }

                DB::commit();

                return response()->json([
                    'message' => 'Event updated successfully.',
                    'event' => $event->load('detail'),
                ], 200);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Failed to update event.', 'error' => $e->getMessage()], 500);
        }
    }

    public function deleteEvent(Request $request, $id)
    {
        $user = $request->user();
        $isAdmin = $user->role === 'admin';
        $event = Event::findOrFail($id);

        if (!$isAdmin) {
            if (!$event->club_id) {
                return response()->json(['message' => 'Only admins can delete general events.'], 403);
            }

            $isOfficer = ClubMembership::where('user_id', $user->id)
                ->where('club_id', $event->club_id)
                ->where('role', 'officer')
                ->where('status', 'approved')
                ->exists();

            if (!$isOfficer) {
                return response()->json(['message' => 'Unauthorized to delete this event'], 403);
            }
        }

        DB::beginTransaction();
        try {
            // FIX: Manually delete all dependencies to absolutely guarantee NO foreign key constraints fail!
            
            // 1. Delete associated Tasks and their assignments
            $tasks = \App\Models\EventTask::where('event_id', $event->id)->get();
            foreach ($tasks as $task) {
                \App\Models\EventTaskAssignment::where('event_task_id', $task->id)->delete();
                $task->delete();
            }

            // 2. Delete associated Attendance Sessions and their records
            $sessions = \App\Models\AttendanceSession::where('event_id', $event->id)->get();
            foreach ($sessions as $session) {
                \App\Models\Attendance::where('attendance_session_id', $session->id)->delete();
                $session->delete();
            }

            // 3. Delete details
            if ($event->detail) {
                $event->detail()->delete();
            }

            // 4. Finally delete the event
            $event->delete();

            DB::commit();
            return response()->json(['message' => 'Event deleted successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete event.', 'error' => $e->getMessage()], 500);
        }
    }
}