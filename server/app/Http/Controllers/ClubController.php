<?php

namespace App\Http\Controllers;

use App\Models\Club;
use Illuminate\Http\Request;

class ClubController extends Controller
{
    // List all clubs
    public function index()
    {
        return response()->json(Club::all());
    }

    // Show a single club
    public function show($id)
    {
        $club = Club::with('users')->findOrFail($id);
        return response()->json($club);
    }

    // Create a new club
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'adviser' => 'nullable|string',
            'logo' => 'nullable|string',
        ]);

        $club = Club::create($validated);
        return response()->json($club, 201);
    }

    // Update club info
    public function update(Request $request, $id)
    {
        $club = Club::findOrFail($id);
        $club->update($request->all());
        return response()->json($club);
    }

    // Delete club
    public function destroy($id)
    {
        $club = Club::findOrFail($id);
        $club->delete();
        return response()->json(['message' => 'Club deleted successfully']);
    }

    public function yourClubs(Request $request)
    {
        $user = $request->user();

        $clubs = $user->clubs()
            ->wherePivot('status', 'approved')
            ->get();

        return response()->json($clubs);
    }

    public function otherClubs(Request $request)
    {
        $user = $request->user();

        $joinedClubIds = $user->clubs()->pluck('clubs.id');

        $clubs = Club::whereNotIn('id', $joinedClubIds)->get();

        return response()->json($clubs);
    }

    public function yourPendingClubs(Request $request)
    {
        $user = $request->user();

        $clubs = $user->clubs()
            ->wherePivot('status', 'pending')
            ->get();

        return response()->json($clubs);
    }
}
