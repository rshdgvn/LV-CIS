<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Services\CloudinaryService;

class ProfileController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    public function show(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            Log::warning('Profile fetch failed: no authenticated user found.');
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $member = Member::where('user_id', $user->id)->first();

        return response()->json([
            'user' => [
                'id'         => $user->id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'email'      => $user->email,
                'role'       => $user->role,
                'avatar'     => $user->avatar,
            ],
            'member' => $member ?? [
                'course'     => null,
                'year_level' => null,
            ],
        ]);
    }

    public function update(Request $request)
    {
        try {
            $user = $request->user();

            $validatedUser = $request->validate([
                'first_name' => 'nullable|string|max:255',
                'last_name'  => 'nullable|string|max:255',
                'email'      => 'nullable|email|max:255|unique:users,email,' . $user->id,
                'avatar'     => 'nullable|file|image|max:2048',
            ]);

            if ($request->hasFile('avatar')) {
                $avatarFile = $request->file('avatar');
                $avatarUrl  = $this->cloudinary->upload($avatarFile, 'avatars');
                $validatedUser['avatar'] = $avatarUrl;
            }

            $user->update($validatedUser);

            $member = null;
            if (strtolower($user->role) !== 'admin') {
                $validatedMember = $request->validate([
                    'course'     => 'nullable|string|max:255',
                    'year_level' => 'nullable|string|max:255',
                ]);

                $member = Member::updateOrCreate(
                    ['user_id' => $user->id],
                    $validatedMember
                );
            } else {
                $member = Member::where('user_id', $user->id)->first();
            }

            return response()->json([
                'message' => 'Profile updated successfully',
                'user'    => [
                    'id'         => $user->id,
                    'first_name' => $user->first_name,
                    'last_name'  => $user->last_name,
                    'email'      => $user->email,
                    'role'       => $user->role,
                    'avatar'     => $user->avatar,
                ],
                'member'  => $member ?? [
                    'course'     => null,
                    'year_level' => null,
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Error updating profile: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'error' => 'Something went wrong while updating profile.',
            ], 500);
        }
    }

    public function setup(Request $request)
    {
        try {
            $user = Auth::user();

            $validated = $request->validate([
                'course'     => 'required|string|max:255',
                'year_level' => 'required|string|max:255',
            ]);

            $member = Member::create([
                'user_id' => $user->id,
                ...$validated,
            ]);

            return response()->json([
                'message' => 'Profile setup successfully',
                'user'    => $user,
                'member'  => $member,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error setting up profile: ' . $e->getMessage(), [
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'An unexpected error occurred while setting up the profile.',
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password'     => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect',
                'errors' => [
                    'current_password' => ['The current password is incorrect.']
                ]
            ], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Password updated successfully']);
    }
}
