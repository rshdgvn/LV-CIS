<?php

namespace App\Http\Controllers;

use App\Models\Club;

class LandingPageController extends Controller
{
    public function clubsByCategory()
    {
        $clubs = Club::select('id', 'name', 'category', 'description', 'logo')
            ->get()
            ->groupBy('category');

        return response()->json($clubs);
    }
}
