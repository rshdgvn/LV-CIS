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
            // Get events for a specific club AND General Events (where club_id is null)
            $query->where(function($q) use ($clubId) {
                $q->where('club_id', $clubId)
                  ->orWhereNull('club_id');
            });
        } elseif (!$isAdmin) {
            // If no club_id and NOT an admin, only show general school events
            $query->whereNull('club_id');
        }
        // If Admin and no club_id, it skips the IFs and fetches EVERYTHING (God Mode)

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
        // FIX: Added 'club' so the frontend doesn't crash when opening Event Details
        $event = Event::with(['detail', 'club'])->findOrFail($id);
        return response()->json($event);
    }

    public function addEvent(Request $request)
    {
        // FIX: Convert literal string "null" from FormData to actual null
        if ($request->has('club_id') && in_array($request->club_id, ['null', 'undefined', ''])) {
            $request->merge(['club_id' => null]);
        }

        $user = $request->user();
        $isAdmin = $user->role === 'admin';
        $clubId = $request->input('club_id');

        // Permission Check
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
                'club_id' => 'nullable|exists:clubs,id',
                'title' => 'required|string|max:255',
                'purpose' => 'required|string',
                'description' => 'required|string',
                'cover_image' => 'nullable|file|image|max:5120',
                'photos.*' => 'nullable|file|image|max:5120',
                'videos.*' => 'nullable|file|mimetypes:video/mp4,video/quicktime|max:20480',
                'status' => 'required|string|in:upcoming,ongoing,completed',

                'event_date' => 'required|date',
                'event_time' => 'required|string',
                'venue' => 'required|string|max:255',
                'organizer' => 'required|string|max:255',
                'contact_person' => 'required|string|max:255',
                'contact_email' => 'required|email',
                'event_mode' => 'required|string|in:online,face_to_face,hybrid',
                'duration' => 'required|string|max:255',
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
                    'purpose' => $validated['purpose'],
                    'description' => $validated['description'],
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
                    'organizer' => $validated['organizer'],
                    'contact_person' => $validated['contact_person'],
                    'contact_email' => $validated['contact_email'],
                    'event_mode' => $validated['event_mode'],
                    'duration' => $validated['duration'],
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
        // FIX: Convert literal string "null" from FormData to actual null
        if ($request->has('club_id') && in_array($request->club_id, ['null', 'undefined', ''])) {
            $request->merge(['club_id' => null]);
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
                return response()->json(['message' => 'Unauthorized. You are not an officer of this club.'], 403);
            }
        }

        try {
            $validated = $request->validate([
                'club_id' => 'nullable|exists:clubs,id',
                'title' => 'required|string|max:255',
                'purpose' => 'required|string',
                'description' => 'required|string',
                'cover_image' => 'sometimes|nullable',
                'photos.*' => 'sometimes|nullable',
                'videos.*' => 'nullable',
                'status' => 'required|string|in:upcoming,ongoing,completed',
                'event_date' => 'required|date',
                'event_time' => 'required|string',
                'venue' => 'required|string|max:255',
                'organizer' => 'required|string|max:255',
                'contact_person' => 'required|string|max:255',
                'contact_email' => 'required|email',
                'event_mode' => 'required|string|in:online,face_to_face,hybrid',
                'duration' => 'required|string|max:255',
            ]);

            $formattedTime = date('H:i:s', strtotime($validated['event_time']));

            DB::beginTransaction();

            try {
                $coverUrl = $event->cover_image;
                if ($request->hasFile('cover_image')) {
                    $newCoverUrl = $this->cloudinary->upload($request->file('cover_image'), 'events/covers');
                    if ($newCoverUrl) $coverUrl = $newCoverUrl;
                } elseif ($request->filled('existing_cover_image')) {
                    $coverUrl = $request->input('existing_cover_image');
                }

                $event->update([
                    'club_id' => $validated['club_id'] ?? $event->club_id,
                    'title' => $validated['title'],
                    'purpose' => $validated['purpose'],
                    'description' => $validated['description'],
                    'cover_image' => $coverUrl,
                    'status' => $validated['status'],
                ]);

                if ($event->detail) {
                    $event->detail->update([
                        'event_date' => $validated['event_date'],
                        'event_time' => $formattedTime,
                        'venue' => $validated['venue'],
                        'organizer' => $validated['organizer'],
                        'contact_person' => $validated['contact_person'],
                        'contact_email' => $validated['contact_email'],
                        'event_mode' => $validated['event_mode'],
                        'duration' => $validated['duration'],
                    ]);
                } else {
                    EventDetail::create([
                        'event_id' => $event->id,
                        'event_date' => $validated['event_date'],
                        'event_time' => $formattedTime,
                        'venue' => $validated['venue'],
                        'organizer' => $validated['organizer'],
                        'contact_person' => $validated['contact_person'],
                        'contact_email' => $validated['contact_email'],
                        'event_mode' => $validated['event_mode'],
                        'duration' => $validated['duration'],
                    ]);
                }

                $session = AttendanceSession::where('event_id', $event->id)->first();
                if ($session) {
                    $session->update([
                        'title' => $validated['title'] . ' - Attendance',
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

        // FIX: Safely check if detail exists before deleting
        if ($event->detail) {
            $event->detail()->delete();
        }
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully.']);
    }
}