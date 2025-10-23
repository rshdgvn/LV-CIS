<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\ClubController;
use App\Http\Controllers\MembershipController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn(Request $request) => $request->user());
    Route::get('/verify-token', [AuthController::class, 'verifyToken']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/clubs', [ClubController::class, 'index']);
    Route::post('/clubs', [ClubController::class, 'store']);
    Route::get('/clubs/{id}', [ClubController::class, 'show']);
    Route::put('/clubs/{id}', [ClubController::class, 'update']);
    Route::delete('/clubs/{id}', [ClubController::class, 'destroy']);

    Route::post('/clubs/{clubId}/join', [MembershipController::class, 'joinClub']);
    Route::delete('/clubs/{clubId}/cancel', [MembershipController::class, 'cancelMembershipRequest']);
    Route::patch('/clubs/{clubId}/members/{userId}', [MembershipController::class, 'updateMembershipStatus']);
    Route::get('/clubs/{clubId}/members', [MembershipController::class, 'getClubMembers']);
    Route::get('/clubs/{clubId}/members/{userId}', [MembershipController::class, 'getClubMember']);
    Route::get('/clubs/{club}/pending-requests', [MembershipController::class, 'getPendingRequests']);

    Route::get('/your/clubs', [ClubController::class, 'yourClubs']);
    Route::get('/other/clubs', [ClubController::class, 'otherClubs']);
    Route::get('/your/pending-clubs', [ClubController::class, 'yourPendingClubs']);
    Route::get('/my/clubs', [MembershipController::class, 'getUserClubs']);
    Route::get('/user/member-info', [MembershipController::class, 'getCurrentUserMemberInfo']);
    Route::post('/user/setup-profile', [MembershipController::class, 'setupMemberProfile']);
    Route::patch('/user/member-info', [MembershipController::class, 'editMemberInfo']);

    Route::post('/clubs/{clubId}/role-change', [MembershipController::class, 'requestRoleChange']);
    Route::post('/clubs/{clubId}/role-change/{userId}/approve', [MembershipController::class, 'approveRoleChange']);
    Route::get('/clubs/{clubId}/role-change-requests', [MembershipController::class, 'getRoleChangeRequests']);
    Route::post('/clubs/{clubId}/role-change/{userId}/reject', [MembershipController::class, 'rejectRoleChange']);

    Route::post('/clubs/{clubId}/members/add', [MembershipController::class, 'addMember']);
    Route::patch('/clubs/{clubId}/members/{userId}/edit', [MembershipController::class, 'editMemberPivot']);
    Route::delete('/clubs/{clubId}/members/{userId}/remove', [MembershipController::class, 'removeMember']);
});
