<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    // GET all announcements
    public function index()
    {
        return response()->json([
            'status' => true,
            'data' => Announcement::latest()->get()
        ], 200);
    }

    // POST create
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|max:255',
            'content' => 'nullable|string',
            'status' => 'nullable|in:active,archived',
        ]);

        $announcement = Announcement::create([
            'title' => $request->title,
            'content' => $request->content,
            'status' => $request->status ?? 'active',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Announcement created successfully',
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
                'message' => 'Announcement not found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $announcement
        ], 200);
    }

    // PATCH update
    public function update(Request $request, $id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'status' => false,
                'message' => 'Announcement not found'
            ], 404);
        }

        $request->validate([
            'title' => 'sometimes|required|max:255',
            'content' => 'nullable|string',
            'status' => 'nullable|in:active,archived',
        ]);

        $announcement->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Announcement updated successfully',
            'data' => $announcement
        ], 200);
    }

    // DELETE destroy
    public function destroy($id)
    {
        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'status' => false,
                'message' => 'Announcement not found'
            ], 404);
        }

        $announcement->delete();

        return response()->json([
            'status' => true,
            'message' => 'Announcement deleted successfully'
        ], 200);
    }
}
