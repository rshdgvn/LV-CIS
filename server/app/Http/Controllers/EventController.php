<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventDetail;
use Illuminate\Http\Request;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class EventController extends Controller
{
    use AuthorizesRequests;

    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    public function getAllEvents()
    {
        $events = Event::with(['detail', 'club:id,name', 'club.users:id,name'])
            ->latest()
            ->get();

        return response()->json($events);
    }

    public function getEventById($id)
    {
        $event = Event::with('detail')->findOrFail($id);
        return response()->json($event);
    }

    public function addEvent(Request $request)
    {
        $this->authorize('create', Event::class);

        try {
            $validated = $request->validate([
                'club_id' => 'required|exists:clubs,id',
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

            $coverUrl = null;
            if ($request->hasFile('cover_image')) {
                $coverUrl = $this->cloudinary->upload($request->file('cover_image'), 'events/covers');
            }

            $photoUrls = [];
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $photoUrls[] = $this->cloudinary->upload($photo, 'events/photos');
                }
            }

            $videoUrls = [];
            if ($request->hasFile('videos')) {
                foreach ($request->file('videos') as $video) {
                    $videoUrls[] = $this->cloudinary->upload($video, 'events/videos');
                }
            }

            $event = Event::create([
                'club_id' => $validated['club_id'],
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

            return response()->json([
                'message' => 'Event created successfully.',
                'event' => $event->load('detail'),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            Log::error('Error creating event: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to create event.',
                'error' => $e->getMessage(), // temporary for debugging
            ], 500);
        }
    }

    public function updateEvent(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'club_id' => 'required|exists:clubs,id',
                'title' => 'required|string|max:255',
                'purpose' => 'required|string',
                'description' => 'required|string',
                'cover_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'photos.*' => 'sometimes|nullable|image|max:5120',
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

            $event = Event::findOrFail($id);
            $this->authorize('update', $event);
            $formattedTime = date('H:i:s', strtotime($validated['event_time']));

            $coverUrl = $event->cover_image;
            if ($request->hasFile('cover_image')) {
                $coverUrl = $this->cloudinary->upload($request->file('cover_image'), 'events/covers');
            } elseif ($request->filled('existing_cover_image')) {
                $coverUrl = $request->input('existing_cover_image');
            }

            $photoUrls = $event->photos ?? [];
            if ($request->hasFile('photos')) {
                $photoUrls = [];
                foreach ($request->file('photos') as $photo) {
                    $photoUrls[] = $this->cloudinary->upload($photo, 'events/photos');
                }
            } elseif ($request->filled('existing_photos')) {
                $photoUrls = is_array($request->input('existing_photos'))
                    ? $request->input('existing_photos')
                    : json_decode($request->input('existing_photos'), true);
            }

            $videoUrls = $event->videos ?? [];
            if ($request->hasFile('videos')) {
                $videoUrls = [];
                foreach ($request->file('videos') as $video) {
                    $videoUrls[] = $this->cloudinary->upload($video, 'events/videos');
                }
            } elseif ($request->filled('existing_videos')) {
                $videoUrls = is_array($request->input('existing_videos'))
                    ? $request->input('existing_videos')
                    : json_decode($request->input('existing_videos'), true);
            }


            $event->update([
                'club_id' => $validated['club_id'],
                'title' => $validated['title'],
                'purpose' => $validated['purpose'],
                'description' => $validated['description'],
                'cover_image' => $coverUrl,
                'photos' => $photoUrls,
                'videos' => $videoUrls,
                'status' => $validated['status'],
            ]);

            $eventDetail = $event->detail;
            if ($eventDetail) {
                $eventDetail->update([
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

            return response()->json([
                'message' => 'Event updated successfully.',
                'event' => $event->load('detail'),
            ], 200);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            Log::error('Error updating event: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Failed to update event.',
                'error' => $e->getMessage(), // temporary for debugging
            ], 500);
        }
    }


    public function deleteEvent($id)
    {
        $event = Event::findOrFail($id);
        $this->authorize('delete', $event);
        $event->detail()->delete();
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully.']);
    }
}
