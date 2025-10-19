<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClubController;
use App\Http\Controllers\MembershipController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/verify-token', [AuthController::class, 'verifyToken'])->middleware('auth:sanctum');

Route::post('/login', [AuthController::class, 'login']);

Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {
    // Club membership routes
    Route::get('/clubs', [ClubController::class, 'index']);
    Route::get('/your/clubs', [ClubController::class, 'yourClubs']);
    Route::get('/other/clubs', [ClubController::class, 'otherClubs']);
    Route::get('/your/pending-clubs/', [ClubController::class, 'yourPendingClubs']);
    Route::get('/clubs/{id}', [ClubController::class, 'show']);
    Route::post('/clubs', [ClubController::class, 'store']);
    Route::put('/clubs/{id}', [ClubController::class, 'update']);
    Route::delete('/clubs/{id}', [ClubController::class, 'destroy']);

    // Membership routes
    Route::post('/clubs/{clubId}/join', [MembershipController::class, 'joinClub']);
    Route::delete('/clubs/{clubId}/cancel', [MembershipController::class, 'cancelMembershipRequest']);
    Route::get('/clubs/{id}', [ClubController::class, 'show']);
    Route::patch('/clubs/{clubId}/members/{userId}', [MembershipController::class, 'updateMembershipStatus']);
    Route::get('/clubs/{clubId}/members', [MembershipController::class, 'getClubMembers']);
    Route::get('/clubs/{clubId}/members/{userId}', [MembershipController::class, 'getClubMember']);
    Route::get('/my/clubs', [MembershipController::class, 'getUserClubs']);
});
