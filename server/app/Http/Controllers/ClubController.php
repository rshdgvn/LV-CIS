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
        $query = Club::withCount('approvedUsers');

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
        
        return response()->json([
            'message' => 'Club created successfully',
            'club' => $club
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $club = Club::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|in:academics,culture_and_performing_arts,socio_politics',
            'description' => 'nullable|string',
            'adviser' => 'nullable|string',
            'logo' => 'nullable|string',
        ]);

        $club->update($validated);
        
        return response()->json([
            'message' => 'Club updated successfully',
            'club' => $club
        ]);
    }

    public function destroy($id)
    {
        $club = Club::findOrFail($id);
        $club->delete();
        
        return response()->json(['message' => 'Club deleted successfully'], 200);
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
