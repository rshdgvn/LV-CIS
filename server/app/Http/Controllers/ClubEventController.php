<?php

namespace App\Http\Controllers;

use App\Models\Club;
use Illuminate\Http\Request;

class ClubEventController extends Controller
{
    public function index($id)
    {
        $club = Club::with(['events'])->find($id);

        if (!$club) {
            return response()->json([
                'message' => 'Club not found.'
            ], 404);
        }

        $events = $club->events->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'cover_image' => $event->cover_image, 
                'photos' => $event->photos ?? [],     
                'videos' => $event->videos ?? [],   
            ];
        });

        return response()->json([
            'club_id' => $club->id,
            'club_name' => $club->name,
            'events' => $events,
        ]);
    }
}
