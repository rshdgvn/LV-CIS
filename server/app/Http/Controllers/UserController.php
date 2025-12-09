<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Club;
use App\Services\CloudinaryService; // Import Cloudinary Service

class UserController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    public function index()
    {
        return response()->json(
            User::with(['member', 'clubs'])->latest()->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|string|min:6|confirmed',
            'role'       => 'required|in:admin,user',
            'course'     => 'nullable|string|max:255',
            'year_level' => 'nullable|string|max:255',
            'avatar'     => 'nullable|file|image|max:2048', // Add avatar validation
        ]);

        $avatarUrl = null;
        if ($request->hasFile('avatar')) {
            $avatarUrl = $this->cloudinary->upload($request->file('avatar'), 'avatars');
        }

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name'  => $validated['last_name'],
            'email'      => $validated['email'],
            'password'   => Hash::make($validated['password']),
            'role'       => $validated['role'],
            'avatar'     => $avatarUrl, // Save avatar URL
            'email_verified_at' => now(),
        ]);

        if ($user->role === 'user' && isset($validated['course'], $validated['year_level'])) {
            $user->member()->create([
                'course'     => $validated['course'],
                'year_level' => $validated['year_level'],
            ]);
        }

        // Auto-assign admin as adviser to all clubs (existing logic)
        if ($user->role === 'admin') {
            $clubs = Club::all();
            foreach ($clubs as $club) {
                DB::table('club_memberships')->updateOrInsert(
                    ['club_id' => $club->id, 'user_id' => $user->id],
                    [
                        'role' => 'adviser',
                        'status' => 'approved',
                        'activity_status' => 'active',
                        'joined_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->load(['member', 'clubs'])
        ], 201);
    }

    public function show(User $user)
    {
        return response()->json(
            $user->load(['member', 'clubs'])
        );
    }

    public function update(Request $request, User $user)
    {
        $oldRole = $user->role;

        // NOTE: removed 'unique' check on email if it hasn't changed to avoid self-validation error logic complexity, 
        // usually handled by 'unique:users,email,' . $user->id
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name'  => 'sometimes|string|max:255',
            'email'      => 'sometimes|email|unique:users,email,' . $user->id,
            'password'   => 'nullable|string|min:6|confirmed',
            'role'       => 'sometimes|in:admin,user',
            'course'     => 'nullable|string|max:255',
            'year_level' => 'nullable|string|max:255',
            'avatar'     => 'nullable|file|image|max:2048',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // Handle Avatar Update
        if ($request->hasFile('avatar')) {
            $avatarUrl = $this->cloudinary->upload($request->file('avatar'), 'avatars');
            $validated['avatar'] = $avatarUrl;
        }

        $user->update($validated);

        // Role Change Logic (Admin <-> User)
        if ($oldRole === 'admin' && $user->role === 'user') {
            DB::table('club_memberships')->where('user_id', $user->id)->delete();
        }

        if ($oldRole === 'user' && $user->role === 'admin') {
            $clubs = Club::all();
            foreach ($clubs as $club) {
                DB::table('club_memberships')->updateOrInsert(
                    ['club_id' => $club->id, 'user_id' => $user->id],
                    [
                        'role' => 'adviser',
                        'status' => 'approved',
                        'activity_status' => 'active',
                        'joined_at' => now(),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        // Update Member details if User
        if ($user->role === 'user' && (isset($validated['course']) || isset($validated['year_level']))) {
            $user->member()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'course'     => $validated['course'] ?? $user->member?->course,
                    'year_level' => $validated['year_level'] ?? $user->member?->year_level,
                ]
            );
        }

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->load(['member', 'clubs']),
        ]);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
