<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CalendarEventController extends Controller
{
    public function index(Request $request)
    {
        // Fetch events only for the requested month to improve performance
        // Expecting ?month=2025-12
        $query = CalendarEvent::query();

        if ($request->has('month')) {
            $date = Carbon::parse($request->month);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            $query->whereBetween('start_time', [$startOfMonth, $endOfMonth]);
        }

        return response()->json($query->get());
    }

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
}
