<?php

use Illuminate\Support\Facades\Storage;

it('checks if club logos exist and are publicly accessible', function () {
    // Ensure the public disk is configured
    expect(Storage::disk('public'))->not->toBeNull();

    // The logo file you expect
    $file = 'club_logos/blue_harmony_logo.png';

    // Check if file exists inside storage
    $existsOnDisk = Storage::disk('public')->exists($file);
    expect($existsOnDisk)->toBeTrue("❌ File not found in storage/app/public/club_logos");

    // Check if symlink exists
    $symlinkExists = file_exists(public_path('storage'));
    expect($symlinkExists)->toBeTrue("❌ The public/storage symlink is missing");

    // Check if the file exists through public path
    $publicFile = public_path("storage/{$file}");
    $existsPublic = file_exists($publicFile);
    expect($existsPublic)->toBeTrue("❌ File not found in public/storage");

    // Optional: check if it’s accessible through HTTP (Render must serve it)
    $response = $this->get("/storage/{$file}");
    $response->assertOk("❌ File not accessible through URL /storage/{$file}");
});
