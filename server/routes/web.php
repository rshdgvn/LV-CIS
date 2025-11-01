<?php


use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/club_logos/{filename}', function ($filename) {
    $path = storage_path('app/public/club_logos/' . $filename);

    if (!file_exists($path)) {
        abort(404, 'Logo not found');
    }

    return response()->file($path);
});
