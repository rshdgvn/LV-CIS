<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    // GET list of announcements
    public function index()
    {
        return response()->json([
            'status' => true,
            'data' => Announcement::orderBy('date', 'asc')->get()
        ], 200);
    }

    // POST create announcement
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'time' => 'required',
            'venue' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,archived'
        ]);

        $announcement = Announcement::create([
            'title' => $request->title,
            'date' => $request->date,
            'time' => $request->time,
            'venue' => $request->venue,
            'description' => $request->description,
            'status' => $request->status ?? 'active',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Announcement created successfully.',
            'data' => $announcement
        ], 201);
    }

    // GET single announcement
    public function show($id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'status' => false,
                'message' => 'Announcement not found.'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $announcement
        ], 200);
    }

    // PATCH update announcement
    public function update(Request $request, $id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'status' => false,
                'message' => 'Announcement not found.'
            ], 404);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|required|date',
            'time' => 'sometimes|required',
            'venue' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,archived'
        ]);

        $announcement->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Announcement updated successfully.',
            'data' => $announcement
        ], 200);
    }

    // DELETE announcement
    public function destroy($id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'status' => false,
                'message' => 'Announcement not found.'
            ], 404);
        }

        $announcement->delete();

        return response()->json([
            'status' => true,
            'message' => 'Announcement deleted successfully.'
        ], 200);
    }
}
