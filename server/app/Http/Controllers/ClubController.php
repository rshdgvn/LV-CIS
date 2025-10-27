<?php

namespace App\Http\Controllers;

use App\Http\Resources\ClubResource;
use App\Models\Club;
use Illuminate\Http\Request;

class ClubController extends Controller
{
    // List all clubs
    public function index(Request $request)
    {
        $query = Club::query();

        if ($request->has('category') && !empty($request->category)) {
            $query->where('category', $request->category);
        }

        $clubs = $query->get();

        return response()->json($clubs);
    }

    // Show a single club
    public function show($id)
    {
        $club = Club::with([
            'users' => function ($query) {
                $query->wherePivot('status', 'approved');
            }
        ])->findOrFail($id);

        return response()->json($club);
    }


    // Create a new club
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:academics,culture_and_performing_arts,socio_politics',
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

    public function yourPendingClubs(Request $request)
    {
        $user = $request->user();

        $clubs = $user->clubs()
            ->wherePivot('status', 'pending')
            ->get();

        return ClubResource::collection($clubs);
    }
}
