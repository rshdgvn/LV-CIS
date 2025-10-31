<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventDetail;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function getAllEvents()
    {
        $events = Event::with(['detail', 'club:id,name'])
            ->with(['club.users:id,name']) 
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
        $validated = $request->validate([
            'club_id' => 'required|exists:clubs,id',
            'title' => 'required|string|max:255',
            'purpose' => 'required|string',
            'description' => 'required|string',
            'cover_image' => 'nullable|string',
            'photos' => 'nullable|array',
            'videos' => 'nullable|array',
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

        $event = Event::create([
            'club_id' => $validated['club_id'],
            'title' => $validated['title'],
            'purpose' => $validated['purpose'],
            'description' => $validated['description'],
            'cover_image' => $validated['cover_image'] ?? null,
            'photos' => $validated['photos'] ?? [],
            'videos' => $validated['videos'] ?? [],
            'status' => $validated['status'],
        ]);

        EventDetail::create([
            'event_id' => $event->id,
            'event_date' => $validated['event_date'],
            'event_time' => $validated['event_time'],
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
    }

    public function updateEvent(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'purpose' => 'sometimes|string',
            'description' => 'sometimes|string',
            'cover_image' => 'nullable|string',
            'photos' => 'nullable|array',
            'videos' => 'nullable|array',
            'status' => 'sometimes|string|in:upcoming,ongoing,completed',

            'event_date' => 'sometimes|date',
            'event_time' => 'sometimes|string',
            'venue' => 'sometimes|string|max:255',
            'organizer' => 'sometimes|string|max:255',
            'contact_person' => 'sometimes|string|max:255',
            'contact_email' => 'sometimes|email',
            'event_mode' => 'sometimes|string|in:online,face_to_face,hybrid',
            'duration' => 'sometimes|string|max:255',
        ]);

        $event->update($validated);

        $event->detail()->updateOrCreate(
            ['event_id' => $event->id],
            array_filter([
                'event_date' => $validated['event_date'] ?? null,
                'event_time' => $validated['event_time'] ?? null,
                'venue' => $validated['venue'] ?? null,
                'organizer' => $validated['organizer'] ?? null,
                'contact_person' => $validated['contact_person'] ?? null,
                'contact_email' => $validated['contact_email'] ?? null,
                'event_mode' => $validated['event_mode'] ?? null,
                'duration' => $validated['duration'] ?? null,
            ])
        );

        return response()->json([
            'message' => 'Event updated successfully.',
            'event' => $event->load('detail'),
        ]);
    }

    public function deleteEvent($id)
    {
        $event = Event::findOrFail($id);
        $event->detail()->delete();
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully.']);
    }
}
