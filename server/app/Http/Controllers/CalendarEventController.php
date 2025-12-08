<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CalendarEventController extends Controller
{
    // GET all events (filtered by month)
    public function index(Request $request)
    {
        $query = CalendarEvent::query();

        if ($request->has('month')) {
            $date = Carbon::parse($request->month);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            $query->whereBetween('start_time', [$startOfMonth, $endOfMonth]);
        }

        return response()->json($query->get());
    }

    // CREATE a new event
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'start_time' => 'required|date',
            'end_time' => 'nullable|date|after:start_time',
            'theme' => 'nullable|string|in:blue,red,yellow,purple'
        ]);

        $event = CalendarEvent::create($validated);

        return response()->json($event, 201);
    }

    // GET a single event
    public function show($id)
    {
        $event = CalendarEvent::findOrFail($id);
        return response()->json($event);
    }

    // UPDATE an existing event
    public function update(Request $request, $id)
    {
        $event = CalendarEvent::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'nullable|date|after:start_time',
            'theme' => 'nullable|string|in:blue,red,yellow,purple'
        ]);

        $event->update($validated);

        return response()->json($event);
    }

    // DELETE an event
    public function destroy($id)
    {
        $event = CalendarEvent::findOrFail($id);
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully.']);
    }
}
