<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
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
        ]);

        $user = User::create([
            'first_name'      => $validated['first_name'],
            'last_name'       => $validated['last_name'],
            'email'           => $validated['email'],
            'password'        => Hash::make($validated['password']),
            'role'            => $validated['role'],
            'email_verified_at' => now(),
        ]);

        if (isset($validated['course'], $validated['year_level']) && $validated['role'] === 'user') {
            $user->member()->create([
                'course'     => $validated['course'],
                'year_level' => $validated['year_level'],
            ]);
        }

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
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
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name'  => 'sometimes|string|max:255',
            'email'      => 'sometimes|email|unique:users,email,' . $user->id,
            // Added 'confirmed' rule here too
            'password'   => 'nullable|string|min:6|confirmed',
            'role'       => 'sometimes|in:admin,user',
            'course'     => 'nullable|string|max:255',
            'year_level' => 'nullable|string|max:255',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        // Logic updated to handle creating member record if it doesn't exist yet
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
            'user' => $user->load('member')
        ]);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
