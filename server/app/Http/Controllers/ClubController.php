<?php

namespace App\Http\Controllers;

use App\Http\Resources\ClubResource;
use App\Models\Club;
use Illuminate\Http\Request;

class ClubController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Club::query();

        if ($request->has('category') && !empty($request->category)) {
            $query->where('category', $request->category);
        }

        $clubs = $query->get()->map(function ($club) use ($user) {
            $membership = $club->users()
                ->where('user_id', $user->id)
                ->first();

            return [
                'id' => $club->id,
                'name' => $club->name,
                'category' => $club->category,
                'description' => $club->description,
                'adviser' => $club->adviser,
                'logo' => $club->logo,
                'status' => $membership?->pivot->status ?? null,
            ];
        });

        return response()->json($clubs);
    }

    public function yourClubs(Request $request)
    {
        $user = $request->user();

        $clubs = $user->clubs()
            ->withPivot('status')
            ->wherePivot('status', 'approved')
            ->get()
            ->map(function ($club) {
                return [
                    'id' => $club->id,
                    'name' => $club->name,
                    'category' => $club->category,
                    'description' => $club->description,
                    'adviser' => $club->adviser,
                    'logo' => $club->logo,
                    'status' => $club->pivot->status,
                ];
            });

        return response()->json($clubs);
    }

    public function yourPendingClubs(Request $request)
    {
        $user = $request->user();

        $clubs = $user->clubs()
            ->withPivot('status')
            ->wherePivot('status', 'pending')
            ->get()
            ->map(function ($club) {
                return [
                    'id' => $club->id,
                    'name' => $club->name,
                    'category' => $club->category,
                    'description' => $club->description,
                    'adviser' => $club->adviser,
                    'logo' => $club->logo,
                    'status' => $club->pivot->status,
                ];
            });

        return response()->json($clubs);
    }


    public function otherClubs(Request $request)
    {
        $user = $request->user();

        $joinedClubIds = $user->clubs()->pluck('clubs.id');

        $query = Club::whereNotIn('id', $joinedClubIds);

        if ($request->has('category') && !empty($request->category)) {
            $query->where('category', $request->category);
        }

        $clubs = $query->get()->map(function ($club) {
            return [
                'id' => $club->id,
                'name' => $club->name,
                'category' => $club->category,
                'description' => $club->description,
                'adviser' => $club->adviser,
                'logo' => $club->logo,
                'status' => null, 
            ];
        });

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
}
