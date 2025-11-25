<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceSessionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\ClubController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MembershipController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TaskController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Services\GmailService;
use Google\Client;

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/auth/google', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);;

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetToken']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])
    ->name('verification.verify');
Route::post('/email/resend', [AuthController::class, 'resendVerification']);


Route::get('/clubs/by-category', [LandingPageController::class, 'clubsByCategory']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn(Request $request) => $request->user());
    Route::get('/verify-token', [AuthController::class, 'verifyToken']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/clubs', [ClubController::class, 'index']);
    Route::post('/clubs', [ClubController::class, 'store']);
    Route::get('/clubs/{id}', [ClubController::class, 'show']);
    Route::put('/clubs/{id}', [ClubController::class, 'update']);
    Route::delete('/clubs/{id}', [ClubController::class, 'destroy']);
    Route::get('/your/clubs', [ClubController::class, 'yourClubs']);
    Route::get('/other/clubs', [ClubController::class, 'otherClubs']);
    Route::get('/your/pending-clubs', [ClubController::class, 'yourPendingClubs']);

    Route::post('/clubs/{clubId}/join', [MembershipController::class, 'joinClub']);
    Route::delete('/clubs/{clubId}/cancel', [MembershipController::class, 'cancelMembershipRequest']);
    Route::patch('/clubs/{clubId}/members/{userId}', [MembershipController::class, 'updateMembershipStatus']);
    Route::get('/clubs/{clubId}/members', [MembershipController::class, 'getClubMembers']);
    Route::get('/clubs/{clubId}/members/{userId}', [MembershipController::class, 'getClubMember']);
    Route::get('/clubs/{club}/pending-requests', [MembershipController::class, 'getPendingRequests']);

    Route::get('/my/clubs', [MembershipController::class, 'getUserClubs']);
    Route::get('/user/member-info', [MembershipController::class, 'getCurrentUserMemberInfo']);
    Route::post('/user/setup-profile', [MembershipController::class, 'setupMemberProfile']);
    Route::patch('/user/member-info', [MembershipController::class, 'editMemberInfo']);

    Route::post('/clubs/{clubId}/members/add', [MembershipController::class, 'addMember']);
    Route::patch('/clubs/{clubId}/members/{userId}/edit', [MembershipController::class, 'editMemberPivot']);
    Route::delete('/clubs/{clubId}/members/{userId}/remove', [MembershipController::class, 'removeMember']);

    Route::get('/events', [EventController::class, 'getAllEvents']);
    Route::get('/events/{id}', [EventController::class, 'getEventById']);
    Route::post('/events', [EventController::class, 'addEvent']);
    Route::patch('/events/{id}', [EventController::class, 'updateEvent']);
    Route::delete('/events/{id}', [EventController::class, 'deleteEvent']);

    Route::get('/tasks', [TaskController::class, 'getAllTasks']);
    Route::get('/task/{id}', [TaskController::class, 'getTaskById']);
    Route::get('/task/{id}', [TaskController::class, 'getTaskDetail']); 
    Route::patch('/task/{id}', [TaskController::class, 'updateTaskById']); 

    Route::post('/tasks/{taskId}/assign', [TaskController::class, 'assignTaskByEmail']);
    Route::post('/create/task', [TaskController::class, 'createTaskForEvent']);
    Route::put('/update/task/{id}', [TaskController::class, 'updateTaskById']);
    Route::delete('/delete/task/{id}', [TaskController::class, 'deleteTaskById']);

    Route::get('/events/{eventId}/tasks', [TaskController::class, 'getTasksByEvent']);


    Route::get('/attendance-sessions', [AttendanceSessionController::class, 'index']);
    Route::get('/attendance-sessions/{id}', [AttendanceSessionController::class, 'show']);

    Route::get('/attendance-sessions/{sessionId}/attendance', [AttendanceController::class, 'index']);
    Route::patch('/attendance-sessions/{sessionId}/members/{userId}', [AttendanceController::class, 'updateStatus']);

    Route::get('/user/profile', [ProfileController::class, 'show']);
    Route::patch('/user/profile', [ProfileController::class, 'update']);
    Route::post('/user/setup-profile', [ProfileController::class, 'setup']);
    Route::post('/user/change-password', [ProfileController::class, 'changePassword']);
});



// Route::get('/gmail/oauth/init', function () {
//     $client = new Client();
//     $client->setClientId(config('gmail.client_id'));
//     $client->setClientSecret(config('gmail.client_secret'));
//     $client->setRedirectUri(config('gmail.redirect_for_gmail')); 
//     $client->setAccessType('offline');
//     $client->setPrompt('consent');
//     $client->addScope(\Google\Service\Gmail::GMAIL_SEND);

//     $authUrl = $client->createAuthUrl();

//     return response()->json([
//         'message' => 'Visit this URL to authorize:',
//         'auth_url' => $authUrl
//     ]);
// });

// Route::get('/gmail/oauth/callback', function () {
//     $code = request()->get('code');

//     if (!$code) {
//         return response()->json(['error' => 'No authorization code received'], 400);
//     }

//     $client = new Client();
//     $client->setClientId(config('gmail.client_id'));
//     $client->setClientSecret(config('gmail.client_secret'));
//     $client->setRedirectUri(config('gmail.redirect_for_gmail'));
//     $client->addScope(\Google\Service\Gmail::GMAIL_SEND);

//     $token = $client->fetchAccessTokenWithAuthCode($code);

//     if (isset($token['error'])) {
//         return response()->json(['error' => $token['error']], 400);
//     }

//     \App\Models\GmailToken::updateOrCreate(
//         ['identifier' => 'system'],
//         [
//             'access_token' => $token['access_token'],
//             'refresh_token' => $token['refresh_token'],
//             'scope' => $token['scope'] ?? 'https://www.googleapis.com/auth/gmail.send',
//             'token_type' => $token['token_type'] ?? 'Bearer',
//             'expires_in' => $token['expires_in'] ?? 3599,
//             'token_created_at' => now(),
//         ]
//     );

//     return response()->json([
//         'success' => true,
//         'message' => 'Gmail tokens successfully generated and saved!',
//         'token' => $token
//     ]);
// });
