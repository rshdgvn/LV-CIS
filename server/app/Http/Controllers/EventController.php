<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventDescription;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function getAllEvents()
    {
        $events = Event::with('description')->latest()->get();
        return response()->json($events);
    }

    public function getEventById($id)
    {
        $event = Event::with('description')->findOrFail($id);
        return response()->json($event);
    }

    public function addEvent(Request $request)
    {
        $validated = $request->validate([
            'club_id' => 'required|exists:clubs,id',
            'title' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'location' => 'required|string|max:255',
            'status' => 'required|string|in:upcoming,ongoing,completed',
            'overview' => 'nullable|string',
            'objectives' => 'nullable|string',
            'details' => 'nullable|string',
        ]);

        $event = Event::create($validated);

        EventDescription::create([
            'event_id' => $event->id,
            'overview' => $validated['overview'] ?? null,
            'objectives' => $validated['objectives'] ?? null,
            'details' => $validated['details'] ?? null,
        ]);

        return response()->json([
            'message' => 'Event created successfully.',
            'event' => $event->load('description')
        ], 201);
    }

    public function updateEvent(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'location' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|in:upcoming,ongoing,completed',
            'overview' => 'nullable|string',
            'objectives' => 'nullable|string',
            'details' => 'nullable|string',
        ]);

        $event->update($validated);

        $event->description()->updateOrCreate(
            ['event_id' => $event->id],
            [
                'overview' => $validated['overview'] ?? $event->description->overview ?? null,
                'objectives' => $validated['objectives'] ?? $event->description->objectives ?? null,
                'details' => $validated['details'] ?? $event->description->details ?? null,
            ]
        );

        return response()->json([
            'message' => 'Event updated successfully.',
            'event' => $event->load('description')
        ]);
    }

    public function deleteEvent($id)
    {
        $event = Event::findOrFail($id);
        $event->description()->delete();
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully.']);
    }
}
