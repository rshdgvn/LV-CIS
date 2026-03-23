<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


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

        $club = Club::withCount('approvedUsers')->findOrFail($id);

        return response()->json($club);
    }


    public function store(Request $request, CloudinaryService $cloudinaryService)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:academics,culture_and_performing_arts,socio_politics',
            'description' => 'nullable|string',
            'adviser' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', 
        ]);

        if ($request->hasFile('logo')) {
            try {
                $uploadedUrl = $cloudinaryService->upload(
                    $request->file('logo'),
                    'lv-cis/clubs' 
                );

                if ($uploadedUrl) {
                    $validated['logo'] = $uploadedUrl;
                }
            } catch (\Exception $e) {
                Log::error('Club creation: Failed to upload logo', ['error' => $e->getMessage()]);
                return response()->json([
                    'message' => 'Failed to upload logo image.',
                    'error' => $e->getMessage()
                ], 500);
            }
        }

        $club = Club::create($validated);

        return response()->json([
            'message' => 'Club created successfully',
            'club' => $club
        ], 201);
    }

    public function update(Request $request, $id, CloudinaryService $cloudinaryService)
    {
        $club = Club::findOrFail($id);

        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|in:academics,culture_and_performing_arts,socio_politics',
            'description' => 'nullable|string',
            'adviser' => 'nullable|string',
        ];

        if ($request->hasFile('logo')) {
            $rules['logo'] = 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120';
        } else {
            $rules['logo'] = 'nullable|string'; 
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('logo')) {
            try {
                $uploadedUrl = $cloudinaryService->upload(
                    $request->file('logo'),
                    'lv-cis/clubs'
                );

                if ($uploadedUrl) {

                    $validated['logo'] = $uploadedUrl;
                }
            } catch (\Exception $e) {
                Log::error('Club update: Failed to upload new logo', ['error' => $e->getMessage()]);
                return response()->json([
                    'message' => 'Failed to upload new logo image.',
                    'error' => $e->getMessage()
                ], 500);
            }
        }

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
            ->withCount('approvedUsers')
            ->wherePivot('status', 'approved')
            ->get();

        return response()->json($clubs);
    }

    public function otherClubs(Request $request)
    {
        $user = $request->user();

        $joinedClubIds = $user->clubs()->pluck('clubs.id');

        $clubs = Club::withCount('approvedUsers')
            ->whereNotIn('id', $joinedClubIds)
            ->get();

        return response()->json($clubs);
    }

    public function yourPendingClubs(Request $request)
    {
        $user = $request->user();

        $clubs = $user->clubs()
            ->withCount('approvedUsers')
            ->wherePivot('status', 'pending')
            ->get();

        return response()->json($clubs);
    }
}
